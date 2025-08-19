const express = require('express');
const router = express.Router();
const ArticleRecommendation = require('../models/ArticleRecommendation');
const { generateAiTip } = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');

// 🔔 CORRIGIDO: A rota agora só usa 'hairType' e 'goal'
router.get('/', authMiddleware, async (req, res) => {
    const { hairType, goal } = req.query;
    if (!hairType || !goal) {
        return res.status(400).json({ error: 'Tipo de cabelo e objetivo são necessários.' });
    }

    try {
        const today = new Date().toISOString().slice(0, 10);

        const cachedArticles = await ArticleRecommendation.findOne({
            hairType,
            goal,
            generationDate: {
                $gte: new Date(today),
                $lt: new Date(today + 'T23:59:59.999Z'),
            },
        });

        if (cachedArticles) {
            console.log('Artigos encontrados no cache!');
            return res.status(200).json({ articles: cachedArticles.articles });
        }

        console.log('Gerando artigos com IA...');
        // 🔔 CORRIGIDO: Chama a IA apenas com os parâmetros necessários
        const aiGeneratedContent = await generateAiTip(hairType, goal); 

        const newArticles = new ArticleRecommendation({
            hairType,
            goal,
            articles: aiGeneratedContent.articles
        });
        await newArticles.save();

        res.status(200).json({ articles: newArticles.articles });

    } catch (error) {
        console.error('Erro ao gerar artigos:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;