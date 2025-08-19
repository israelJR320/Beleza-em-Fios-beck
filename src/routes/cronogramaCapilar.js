const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const { generateAiRoutine } = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');

// 🔔 CORRIGIDO: Muda o método para POST e adiciona o middleware de autenticação
router.post('/', authMiddleware, async (req, res) => {
    // 🔔 CORRIGIDO: A rota agora recebe os parâmetros do corpo da requisição (req.body)
    const { hairType, goal, frequency, scalp, hairThickness, hairDamage, productPreferences } = req.body;

    if (!hairType || !goal || !frequency || !scalp || !hairThickness || !hairDamage) {
        return res.status(400).json({ error: 'Todos os campos do formulário são necessários.' });
    }

    try {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        const cachedRoutine = await Routine.findOne({
            hairType,
            goal,
            frequency,
            scalp,
            hairThickness,
            hairDamage,
            generationDate: { $gte: twoHoursAgo },
        });

        if (cachedRoutine) {
            console.log('Cronograma encontrado no cache!');
            return res.status(200).json({
                duration: cachedRoutine.duration,
                routine: cachedRoutine.steps,
                products: cachedRoutine.products
            });
        }

        console.log('Gerando cronograma com IA...');
        const aiGeneratedContent = await generateAiRoutine(hairType, goal, frequency, scalp, hairThickness, hairDamage, productPreferences);

        const newRoutine = new Routine({
            hairType,
            goal,
            frequency,
            scalp,
            hairThickness,
            hairDamage,
            duration: aiGeneratedContent.duration,
            steps: aiGeneratedContent.routine,
            products: aiGeneratedContent.products,
        });
        await newRoutine.save();

        res.status(200).json({
            duration: newRoutine.duration,
            routine: newRoutine.steps,
            products: newRoutine.products
        });

    } catch (error) {
        console.error('Erro ao gerar cronograma:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;