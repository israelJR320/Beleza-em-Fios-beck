const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { comparePhotos } = require('../services/aiService');

const VERIFICATIONS_PER_WEEK = 1;
const POINTS_FOR_EXTRA_VERIFICATION = 500; // Valor corrigido para 500 pontos

router.post('/compare', async (req, res) => {
    const { imageBefore, imageAfter } = req.body;
    const user = req.user;
    const hairType = user.profile.hairType;

    if (!imageBefore || !imageAfter) {
        return res.status(400).json({ error: 'Duas imagens são necessárias para a comparação.' });
    }

    const now = new Date();
    const lastVerificationDate = user.lastVerificationDate ? new Date(user.lastVerificationDate) : null;
    const isNewWeek = !lastVerificationDate || now.getTime() - lastVerificationDate.getTime() > 7 * 24 * 60 * 60 * 1000;

    if (isNewWeek) {
        user.weeklyVerificationsUsed = 0;
    }

    if (user.weeklyVerificationsUsed >= VERIFICATIONS_PER_WEEK) {
        if (user.points >= POINTS_FOR_EXTRA_VERIFICATION) {
            user.points -= POINTS_FOR_EXTRA_VERIFICATION;
            user.weeklyVerificationsUsed += 1;
        } else {
            return res.status(429).json({ error: 'Limite de verificações semanais atingido e pontos insuficientes.' });
        }
    } else {
        user.weeklyVerificationsUsed += 1;
    }

    user.lastVerificationDate = now;
    await user.save();

    try {
        const analysis = await comparePhotos(imageBefore, imageAfter, hairType);
        res.status(200).json({ analysis });
    } catch (error) {
        console.error('Erro ao analisar as fotos:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;