const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { askAiQuestion } = require('../services/aiService');

const MAX_QUESTIONS_PER_DAY = 2;
const POINTS_FOR_EXTRA_QUESTION = 200;

router.post('/', async (req, res) => {
    const { question } = req.body;
    const user = req.user;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Reinicia o contador se for um novo dia
    if (!user.lastQuestionDate || user.lastQuestionDate < today) {
        user.dailyQuestionsUsed = 0;
        user.lastQuestionDate = now;
    }

    // Verifica se o limite foi atingido
    if (user.dailyQuestionsUsed >= MAX_QUESTIONS_PER_DAY) {
        // Se não houver perguntas grátis, verifica os pontos
        if (user.points >= POINTS_FOR_EXTRA_QUESTION) {
            user.points -= POINTS_FOR_EXTRA_QUESTION;
            user.dailyQuestionsUsed += 1;
        } else {
            return res.status(429).json({ error: 'Limite de perguntas diárias atingido e pontos insuficientes.' });
        }
    } else {
        // Usa uma pergunta gratuita
        user.dailyQuestionsUsed += 1;
    }
    
    // Salva o utilizador uma vez com todas as atualizações
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

module.exports = router;