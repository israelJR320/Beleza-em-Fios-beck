const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const { generateAiRoutine } = require('../services/aiService');

router.get('/', async (req, res) => {
    const { hairType, goal } = req.query;

    if (!hairType || !goal) {
        return res.status(400).json({ error: 'Tipo de cabelo e objetivo são necessários.' });
    }

    try {
        const cachedRoutine = await Routine.findOne({ hairType, goal }).sort({ generationDate: -1 });
        if (cachedRoutine) {
            console.log('Cronograma encontrado no cache!');
            return res.status(200).json({ routine: cachedRoutine });
        }

        console.log('Gerando cronograma com IA...');
        const aiGeneratedContent = await generateAiRoutine(hairType, goal);

        const newRoutine = new Routine({
            hairType,
            goal,
            duration: aiGeneratedContent.duration,
            steps: aiGeneratedContent.routine,
            products: aiGeneratedContent.products,
        });
        await newRoutine.save();

        res.status(200).json({ routine: newRoutine });

    } catch (error) {
        console.error('Erro ao gerar cronograma:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;
