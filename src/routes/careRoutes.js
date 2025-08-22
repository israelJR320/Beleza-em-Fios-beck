const express = require('express');
const router = express.Router();
const DailyAlert = require('../models/DailyAlert');
const { generateAiTip } = require('../services/aiService');
const { getWeatherByCity } = require('../services/weatherService');
// ✅ CORRIGIDO: A importação do middleware de autenticação é adicionada.
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
    console.log("📥 Query recebida:", req.query);

    const { tipoCabelo, objetivos, city } = req.query;
    if (!tipoCabelo || !objetivos || !city) {
        return res.status(400).json({ error: 'Tipo de cabelo, objetivo e cidade são necessários.' });
    }

    try {
        const weather = await getWeatherByCity(city);
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        const cachedAlert = await DailyAlert.findOne({
            tipoCabelo,
            objetivos,
            city,
            'weather.condition': weather.condition,
            generationDate: { $gte: twoHoursAgo },
        });

        if (cachedAlert) {
            console.log('Alertas encontrados no cache!');
            return res.status(200).json({ alerts: cachedAlert.alerts });
        }

        console.log('Gerando alertas com IA...');
        const aiGeneratedContent = await generateAiTip(tipoCabelo, objetivos, city, weather);

        const newAlert = new DailyAlert({
            tipoCabelo,
            objetivos,
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