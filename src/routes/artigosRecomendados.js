const express = require('express');
const router = express.Router();
const ArticleRecommendation = require('../models/ArticleRecommendation');
const { generateAiTip } = require('../services/aiService');

router.get('/', async (req, res) => {
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
        const aiGeneratedContent = await generateAiTip(hairType, goal, "São Paulo", { temperature: 25, humidity: 50, condition: "ensolarado" });

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
