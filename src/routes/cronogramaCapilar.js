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
        // ATUALIZADO: Agora a função generateAiRoutine retorna também os produtos detalhados com type e description
        const aiGeneratedContent = await generateAiRoutine(hairType, goal, frequency, scalp, hairThickness, hairDamage);

        const newRoutine = new Routine({
            hairType,
            goal,
            frequency,
            scalp,
            hairThickness,
            hairDamage,
            // ATUALIZADO: duration vem diretamente da IA
            duration: aiGeneratedContent.duration,
            // ATUALIZADO: steps agora inclui dias da semana, minutos e produtos
            steps: aiGeneratedContent.routine,
            // ATUALIZADO: products inclui type e description conforme o novo formato
            products: aiGeneratedContent.products,
        });
        await newRoutine.save();

        // ATUALIZADO: retornar o objeto completo detalhado do cronograma
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
