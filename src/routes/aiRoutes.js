// aiRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { askAiQuestion, comparePhotos } = require('../services/aiService');

const MAX_QUESTIONS_PER_DAY = 2;
const POINTS_FOR_EXTRA_QUESTION = 200;
const MAX_COMPARISONS_PER_WEEK = 1;
const POINTS_FOR_EXTRA_COMPARISON = 500;

router.post('/', async (req, res) => {
    const { question } = req.body;
    const user = req.user;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!user.lastQuestionDate || user.lastQuestionDate < today) {
        user.dailyQuestionsUsed = 0;
        user.lastQuestionDate = now;
    }

    if (user.dailyQuestionsUsed >= MAX_QUESTIONS_PER_DAY) {
        if (user.points >= POINTS_FOR_EXTRA_QUESTION) {
            user.points -= POINTS_FOR_EXTRA_QUESTION;
            user.dailyQuestionsUsed += 1;
        } else {
            return res.status(429).json({ error: 'Limite de perguntas diárias atingido e pontos insuficientes.' });
        }
    } else {
        user.dailyQuestionsUsed += 1;
    }
    
    user.lastQuestionDate = now;
    await user.save();

    try {
        const answer = await askAiQuestion(question);
        res.status(200).json({ answer });
    } catch (error) {
        console.error('Erro ao processar a pergunta da IA:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

router.post('/compare-photos', async (req, res) => {
    const { imageBeforeBase64, imageAfterBase64, hairType } = req.body;
    const user = req.user;

    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

    if (!user.lastVerificationDate || user.lastVerificationDate < startOfWeek) {
        user.weeklyVerificationsUsed = 0;
        user.lastVerificationDate = now;
    }

    if (user.weeklyVerificationsUsed >= MAX_COMPARISONS_PER_WEEK) {
        if (user.points >= POINTS_FOR_EXTRA_COMPARISON) {
            user.points -= POINTS_FOR_EXTRA_COMPARISON;
        } else {
            return res.status(429).json({ error: 'Limite de comparações semanais atingido e pontos insuficientes.' });
        }
    }

    try {
        const analysis = await comparePhotos(imageBeforeBase64, imageAfterBase64, hairType);
        user.weeklyVerificationsUsed += 1;
        user.lastVerificationDate = now;
        await user.save();

        res.status(200).json({ analysis });
    } catch (error) {
        console.error('Erro na análise de fotos:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// 🔔 NOVO: Rota para desbloquear uma comparação de fotos com pontos
router.post('/unlock-comparison', async (req, res) => {
    const user = req.user;
    const cost = POINTS_FOR_EXTRA_COMPARISON;

    if (!user) {
        return res.status(401).json({ error: 'Utilizador não autenticado.' });
    }

    if (user.points < cost) {
        return res.status(402).json({ error: 'Pontos insuficientes para desbloquear a comparação.' });
    }

    try {
        user.points -= cost;
        user.weeklyVerificationsUsed = 0; // Reinicia o contador para dar mais um uso
        await user.save();
        
        res.status(200).json({ message: 'Comparação desbloqueada com sucesso.', newPoints: user.points });

    } catch (error) {
        console.error('Erro ao desbloquear comparação:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;