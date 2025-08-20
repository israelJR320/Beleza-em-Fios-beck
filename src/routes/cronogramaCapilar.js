const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const { generateAiRoutine } = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ CORREÇÃO: A rota agora tem um nome específico, alinhando com a chamada do frontend.
router.post('/generate', authMiddleware, async (req, res) => {
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
            console.log('✅ Cronograma encontrado no cache!');
            return res.status(200).json({
                duration: cachedRoutine.duration,
                routine: cachedRoutine.steps,
                products: cachedRoutine.products
            });
        }

        console.log('⏳ Gerando cronograma com IA...');
        const aiGeneratedContent = await generateAiRoutine(hairType, goal, frequency, scalp, hairThickness, hairDamage, productPreferences);

        // ✅ CORREÇÃO: Verifica se o conteúdo gerado pela IA é válido.
        // Isso impede o erro de 'rotina vazia'.
        if (!aiGeneratedContent || !aiGeneratedContent.routine || aiGeneratedContent.routine.length === 0) {
            console.error('❌ Erro na geração da rotina: A IA devolveu dados incompletos ou vazios.');
            return res.status(500).json({ error: 'Erro ao gerar a rotina. Tente novamente.' });
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

        console.log('🎉 Cronograma gerado e salvo com sucesso!');
        res.status(200).json({
            duration: newRoutine.duration,
            routine: newRoutine.steps,
            products: newRoutine.products
        });

    } catch (error) {
        console.error('❌ Erro ao gerar cronograma:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;