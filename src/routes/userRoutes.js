const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Rota para atualizar a pontuação do utilizador
router.post('/points', async (req, res) => {
    // O utilizador vem do middleware de autenticação
    const user = req.user;
    // A ação e os pontos vêm do frontend
    const { action, points } = req.body;

    // Garante que o frontend está a enviar as informações corretas
    if (!action || typeof points !== 'number') {
        return res.status(400).json({ error: 'Ação e pontuação são necessárias.' });
    }

    try {
        // Atualiza a pontuação do utilizador
        user.points += points;
        await user.save();

        res.status(200).json({ message: 'Pontuação atualizada com sucesso.', newPoints: user.points });

    } catch (error) {
        console.error('Erro ao atualizar a pontuação:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Rota para atualizar a preferência de notificação push
router.put('/notifications', async (req, res) => {
    const user = req.user;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'O valor de "enabled" deve ser verdadeiro ou falso.' });
    }

    try {
        user.pushNotificationsEnabled = enabled;
        await user.save();

        res.status(200).json({ message: 'Preferência de notificação atualizada com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar preferência de notificação:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Exporta o roteador uma única vez
module.exports = router;