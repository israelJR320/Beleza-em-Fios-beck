const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const { generateAiRoutine } = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate', authMiddleware, async (req, res) => {
    const { hairType, goal, frequency, scalp, hairThickness, hairDamage } = req.body; // ✅ CORREÇÃO: Removido 'productPreferences'

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
            console.log('✅ Cronograma encontrado no cache! (cronogramaCapilar.js)');
            return res.status(200).json({
                duration: cachedRoutine.duration,
                routine: cachedRoutine.steps,
                products: cachedRoutine.products
            });
        }

        console.log('⏳ Gerando cronograma com IA... (cronogramaCapilar.js)');
        
        let aiGeneratedContent;
        try {
            // ✅ CORREÇÃO: Removido 'productPreferences' da chamada da função
            aiGeneratedContent = await generateAiRoutine(hairType, goal, frequency, scalp, hairThickness, hairDamage);
            console.log('✅ Resposta da IA recebida: (cronogramaCapilar.js)', aiGeneratedContent);
        } catch (aiError) {
            console.error('❌ Erro na chamada da IA: (cronogramaCapilar.js)', aiError);
            return res.status(500).json({ error: 'Erro ao conectar com o serviço de IA. Tente novamente mais tarde.' });
        }

        if (!aiGeneratedContent || !aiGeneratedContent.routine || !Array.isArray(aiGeneratedContent.routine) || aiGeneratedContent.routine.length === 0) {
            console.error('❌ A IA devolveu uma rotina vazia ou inválida. (cronogramaCapilar.js)');
            return res.status(500).json({ error: 'A IA não conseguiu gerar um cronograma válido. Tente outras combinações.' });
        }

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

        console.log('🎉 Cronograma gerado e salvo com sucesso! (cronogramaCapilar.js)');
        res.status(200).json({
            duration: newRoutine.duration,
            routine: newRoutine.steps,
            products: newRoutine.products
        });

    } catch (error) {
        console.error('❌ Erro ao gerar cronograma no servidor: (cronogramaCapilar.js)', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;