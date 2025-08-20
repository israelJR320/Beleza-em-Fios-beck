const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Rota para obter as configurações do utilizador
// 🔔 CORRIGIDO: Adiciona o middleware de autenticação
router.get('/settings', authMiddleware, async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    try {
        const userSettings = await User.findById(user._id).select('pushNotificationsEnabled');

        if (!userSettings) {
            return res.status(404).json({ error: 'Configurações do utilizador não encontradas.' });
        }

        res.status(200).json(userSettings);
    } catch (error) {
        console.error('Erro ao buscar as configurações do utilizador:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Rota para atualizar o perfil do utilizador (nome, sexo, foto, etc.)
// 🔔 CORRIGIDO: Adiciona o middleware de autenticação
router.put('/profile', authMiddleware, async (req, res) => {
    const user = req.user;
    const { name, photo, profile } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'O nome é obrigatório.' });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                name: name,
                photo: photo,
                profile: profile,
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        res.status(200).json({ message: 'Perfil atualizado com sucesso.', user: updatedUser });

    } catch (error) {
        console.error('Erro ao atualizar o perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Rota para excluir o perfil do utilizador
// 🔔 CORRIGIDO: Adiciona o middleware de autenticação
router.delete('/profile', authMiddleware, async (req, res) => {
    const user = req.user;

    try {
        const result = await User.findByIdAndDelete(user._id);

        if (!result) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        res.status(200).json({ message: 'Perfil excluído com sucesso.' });

    } catch (error) {
        console.error('Erro ao excluir o perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Rota para atualizar a pontuação do utilizador
// 🔔 CORRIGIDO: Adiciona o middleware de autenticação
router.post('/points', authMiddleware, async (req, res) => {
    const user = req.user;
    const { points } = req.body; // 🔔 CORRIGIDO: Remove o campo 'action'

    if (typeof points !== 'number') {
        return res.status(400).json({ error: 'A pontuação deve ser um número.' });
    }

    try {
        user.points += points;
        await user.save();

        res.status(200).json({ message: 'Pontuação atualizada com sucesso.', newPoints: user.points });

    } catch (error) {
        console.error('Erro ao atualizar a pontuação:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Rota para atualizar a preferência de notificação push
// 🔔 CORRIGIDO: Adiciona o middleware de autenticação
router.put('/notifications', authMiddleware, async (req, res) => {
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

// Rota para obter os dados do perfil do utilizador
// 🔔 CORRIGIDO: Adiciona o middleware de autenticação
router.get('/profile', authMiddleware, async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    try {
        const userProfile = await User.findById(user._id).select('-password');
        if (!userProfile) {
            return res.status(404).json({ error: 'Perfil do utilizador não encontrado.' });
        }
        res.status(200).json(userProfile);
    } catch (error) {
        console.error('Erro ao buscar o perfil do utilizador:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

module.exports = router;