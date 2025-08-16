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

module.exports = router;