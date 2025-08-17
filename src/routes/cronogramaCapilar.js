// cronogramaCapilar.js
const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const { generateAiRoutine } = require('../services/aiService');

router.get('/', async (req, res) => {
    // ATUALIZADO: A rota agora só recebe os parâmetros do formulário que o usuário preenche.
    const { hairType, goal, frequency, scalp, hairThickness, hairDamage } = req.query;

    if (!hairType || !goal || !frequency || !scalp || !hairThickness || !hairDamage) {
        return res.status(400).json({ error: 'Todos os campos do formulário são necessários.' });
    }

    try {
        // A lógica de cache agora usa os novos parâmetros
        const cachedRoutine = await Routine.findOne({ hairType, goal, frequency, scalp, hairThickness, hairDamage }).sort({ generationDate: -1 });
        if (cachedRoutine) {
            console.log('Cronograma encontrado no cache!');
            return res.status(200).json({ routine: cachedRoutine });
        }

        console.log('Gerando cronograma com IA...');
        // A IA é chamada com todos os parâmetros do formulário
        // A lógica de gerar os produtos baseados nisso deve estar dentro da função 'generateAiRoutine'
        const aiGeneratedContent = await generateAiRoutine(hairType, goal, frequency, scalp, hairThickness, hairDamage);

        const newRoutine = new Routine({
            hairType,
            goal,
            frequency,
            scalp,
            hairThickness,
            hairDamage,
            duration: aiGeneratedContent.duration,
            steps: aiGeneratedContent.routine,
            products: aiGeneratedContent.products, // Presume que a IA vai retornar um objeto com produtos
        });
        await newRoutine.save();

        res.status(200).json({ routine: newRoutine });

    } catch (error) {
        console.error('Erro ao gerar cronograma:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;