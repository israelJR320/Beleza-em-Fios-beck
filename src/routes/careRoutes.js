// src/routes/careRoutes.js

const express = require('express');
const router = express.Router();
const DailyTip = require('../models/DailyTip');
const { generateAiTip } = require('../services/aiService'); // A sua função de IA
const { getWeatherByCity } = require('../services/weatherService'); // O nosso novo serviço de clima

router.get('/', async (req, res) => {
    // Recebe o tipo de cabelo, o objetivo e a cidade do frontend
    const { hairType, goal, city } = req.query;

    if (!hairType || !goal || !city) {
        return res.status(400).json({ error: 'Tipo de cabelo, objetivo e cidade são necessários.' });
    }

    try {
        // 1. Obtém as informações do clima
        const weather = await getWeatherByCity(city);
        const today = new Date().toISOString().slice(0, 10);

        // 2. Tenta encontrar uma dica no cache com base no perfil, cidade e clima
        const cachedTip = await DailyTip.findOne({
            hairType,
            goal,
            city,
            // Usamos a condição do clima para o cache
            'weather.condition': weather.condition,
            generationDate: {
                $gte: new Date(today),
                $lt: new Date(today + 'T23:59:59.999Z'),
            },
        });

        if (cachedTip) {
            console.log('Dica encontrada no cache!');
            return res.status(200).json({ tip: cachedTip.content });
        }

        console.log('Dica não encontrada, a gerar uma nova com a IA...');

        // 3. Se não houver, chama a IA para gerar a dica, passando também o clima
        const aiGeneratedContent = await generateAiTip(hairType, goal, city, weather);

        // 4. Salva a nova dica no banco de dados
        const newTip = new DailyTip({
            hairType,
            goal,
            city,
            weather: {
                temperature: weather.temperature,
                humidity: weather.humidity,
                condition: weather.condition,
            },
            content: aiGeneratedContent,
        });
        await newTip.save();

        res.status(200).json({ tip: newTip.content });

    } catch (error) {
        console.error('Erro na rota de cuidados diários:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;