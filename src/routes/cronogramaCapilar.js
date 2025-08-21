// src/routes/cronogramaCapilar.js

const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const { generateAiRoutine } = require('../services/aiService');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate', authMiddleware, async (req, res) => {
    // ✅ CORREÇÃO: Adicionada a nova propriedade 'startDate'
    const { tipoCabelo, objetivos, frequencia, condicaoCouroCabeludo, espessura, danos, startDate } = req.body;

    // ✅ CORREÇÃO: Validação para incluir a data de início
    if (!tipoCabelo || !objetivos || !frequencia || !condicaoCouroCabeludo || !espessura || !danos || !startDate) {
        return res.status(400).json({ error: 'Todos os campos do formulário são necessários.' });
    }

    try {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        const cachedRoutine = await Routine.findOne({
            tipoCabelo,
            objetivos,
            frequencia,
            condicaoCouroCabeludo,
            espessura,
            danos,
            generationDate: { $gte: twoHoursAgo },
        });

        if (cachedRoutine) {
            console.log('✅ Cronograma encontrado no cache! (cronogramaCapilar.js)');
            return res.status(200).json({
                duracao: cachedRoutine.duracao,
                rotina: cachedRoutine.rotina,
                produtos: cachedRoutine.produtos
            });
        }

        console.log('⏳ Gerando cronograma com IA... (cronogramaCapilar.js)');
        
        let aiGeneratedContent;
        try {
            // ✅ CORREÇÃO: Passa a nova data de início para a função da IA
            aiGeneratedContent = await generateAiRoutine(tipoCabelo, objetivos, frequencia, condicaoCouroCabeludo, espessura, danos, startDate);
            console.log('✅ Resposta da IA recebida: (cronogramaCapilar.js)', aiGeneratedContent);
        } catch (aiError) {
            console.error('❌ Erro na chamada da IA: (cronogramaCapilar.js)', aiError);
            return res.status(500).json({ error: 'Erro ao conectar com o serviço de IA. Tente novamente mais tarde.' });
        }

        if (!aiGeneratedContent || !aiGeneratedContent.rotina || !Array.isArray(aiGeneratedContent.rotina) || aiGeneratedContent.rotina.length === 0) {
            console.error('❌ A IA devolveu uma rotina vazia ou inválida. (cronogramaCapilar.js)');
            return res.status(500).json({ error: 'A IA não conseguiu gerar um cronograma válido. Tente outras combinações.' });
        }

        const newRoutine = new Routine({
            tipoCabelo,
            objetivos,
            frequencia,
            condicaoCouroCabeludo,
            espessura,
            danos,
            duracao: aiGeneratedContent.duracao,
            rotina: aiGeneratedContent.rotina,
            produtos: aiGeneratedContent.produtos,
        });
        await newRoutine.save();

        console.log('🎉 Cronograma gerado e salvo com sucesso! (cronogramaCapilar.js)');
        res.status(200).json({
            duracao: newRoutine.duracao,
            rotina: newRoutine.rotina,
            produtos: newRoutine.produtos
        });

    } catch (error) {
        console.error('❌ Erro ao gerar cronograma no servidor: (cronogramaCapilar.js)', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;