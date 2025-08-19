// aiRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { askAiQuestion, comparePhotos } = require('../services/aiService');
const auth = require('../middleware/authMiddleware');

const MAX_QUESTIONS_PER_DAY = 2;
const POINTS_FOR_EXTRA_QUESTION = 200;
const MAX_COMPARISONS_PER_WEEK = 1;
const POINTS_FOR_EXTRA_COMPARISON = 500;

// Middleware para verificar se a data precisa de ser resetada
const checkAndResetDailyCounter = (user) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (!user.lastQuestionDate || user.lastQuestionDate < today) {
        user.dailyQuestionsUsed = 0;
        user.lastQuestionDate = now;
    }
    return user;
};

const checkAndResetWeeklyCounter = (user) => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    if (!user.lastVerificationDate || user.lastVerificationDate < startOfWeek) {
        user.weeklyVerificationsUsed = 0;
        user.lastVerificationDate = now;
    }
    return user;
};

// 🔔 Rota para fazer uma pergunta à IA
router.post('/', authMiddleware, async (req, res) => {
    const { question } = req.body;
    let user = req.user;

    user = checkAndResetDailyCounter(user);

    if (user.dailyQuestionsUsed >= MAX_QUESTIONS_PER_DAY) {
        return res.status(429).json({ error: 'Limite de perguntas diárias atingido. Por favor, compre mais usos.' });
    } else {
        user.dailyQuestionsUsed += 1;
    }
    
    await user.save();

    try {
        const answer = await askAiQuestion(question);
        res.status(200).json({ answer });
    } catch (error) {
        console.error('Erro ao processar a pergunta da IA:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// 🔔 Rota para comparar fotos
router.post('/compare', authMiddleware, async (req, res) => {
    const { imageBefore, imageAfter } = req.body;
    let user = req.user;
    const hairType = user.profile?.hairType;

    if (!imageBefore || !imageAfter) {
        return res.status(400).json({ error: 'Duas imagens são necessárias para a comparação.' });
    }

    user = checkAndResetWeeklyCounter(user);

    if (user.weeklyVerificationsUsed >= MAX_COMPARISONS_PER_WEEK) {
        return res.status(429).json({ error: 'Limite de verificações semanais atingido. Por favor, compre mais usos.' });
    }

    try {
        const analysis = await comparePhotos(imageBefore, imageAfter, hairType);
        user.weeklyVerificationsUsed += 1;
        user.lastVerificationDate = new Date();
        await user.save();

        res.status(200).json({ analysis });
    } catch (error) {
        console.error('Erro na análise de fotos:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// 🔔 Rota unificada para desbloquear recursos com pontos
router.post('/unlock', auth, async (req, res) => {
    const { type } = req.body;
    let user = req.user;

    if (!user) {
        return res.status(401).json({ error: 'Utilizador não autenticado.' });
    }

    let cost = 0;
    if (type === 'question') {
        cost = POINTS_FOR_EXTRA_QUESTION;
    } else if (type === 'comparison') {
        cost = POINTS_FOR_EXTRA_COMPARISON;
    } else {
        return res.status(400).json({ error: 'Tipo de recurso inválido.' });
    }

    if (user.points < cost) {
        return res.status(402).json({ error: 'Pontos insuficientes para desbloquear o recurso.' });
    }

    try {
        user.points -= cost;
        if (type === 'question') {
            user.dailyQuestionsUsed -= 1;
        } else if (type === 'comparison') {
            user.weeklyVerificationsUsed -= 1;
        }
        
        await user.save();
        
        // Retorna os dados completos de gamificação para o frontend
        res.status(200).json({
            message: 'Recurso desbloqueado com sucesso.',
            gamificationData: {
                pontos: user.points,
                perguntasIArestantes: MAX_QUESTIONS_PER_DAY - user.dailyQuestionsUsed,
                comparacoesFotosRestantes: MAX_COMPARISONS_PER_WEEK - user.weeklyVerificationsUsed,
                medalhas: user.medalhas,
                desafios: user.desafios,
            }
        });

    } catch (error) {
        console.error('Erro ao desbloquear recurso:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;