const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Rota para obter as configurações do utilizador
router.get('/settings', async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    try {
        // Encontra o utilizador e retorna apenas as configurações relevantes
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
router.put('/profile', async (req, res) => {
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
router.delete('/profile', async (req, res) => {
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
router.post('/points', async (req, res) => {
    const user = req.user;
    const { action, points } = req.body;

    if (!action || typeof points !== 'number') {
        return res.status(400).json({ error: 'Ação e pontuação são necessárias.' });
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

// Rota para obter os dados do perfil do utilizador
router.get('/profile', async (req, res) => {
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