const express = require('express');
const router = express.Router();
const DailyAlert = require('../models/DailyAlert');
const { generateAiTip } = require('../services/aiService');
const { getWeatherByCity } = require('../services/weatherService');
const auth = require('../middleware/authMiddleware'); // Assumindo que você tem um middleware de autenticação

// 🔔 CORRIGIDO: Adiciona o middleware de autenticação à rota
router.get('/', authMiddleware, async (req, res) => {
    const { hairType, goal, city } = req.query;
    if (!hairType || !goal || !city) {
        return res.status(400).json({ error: 'Tipo de cabelo, objetivo e cidade são necessários.' });
    }

    try {
        const weather = await getWeatherByCity(city);
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        const cachedAlert = await DailyAlert.findOne({
            hairType,
            goal,
            city,
            'weather.condition': weather.condition,
            generationDate: { $gte: twoHoursAgo },
        });

        if (cachedAlert) {
            console.log('Alertas encontrados no cache!');
            return res.status(200).json({ alerts: cachedAlert.alerts });
        }

        console.log('Gerando alertas com IA...');
        const aiGeneratedContent = await generateAiTip(hairType, goal, city, weather);

        const newAlert = new DailyAlert({
            hairType,
            goal,
            city,
            weather,
            alerts: aiGeneratedContent.alerts
        });
        await newAlert.save();

        res.status(200).json({ alerts: newAlert.alerts });

    } catch (error) {
        console.error('Erro ao gerar alertas:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;