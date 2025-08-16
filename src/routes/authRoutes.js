const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

require('dotenv').config();

// Inicializa o cliente do Google com o nosso Client ID
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'uma_chave_secreta_muito_forte';

// Rota de login com Google
router.post('/google', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token do Google não fornecido.' });
    }

    try {
        // 1. Verifica a validade do token do Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        // 2. Procura o utilizador na nossa base de dados
        let user = await User.findOne({ googleId: payload.sub });

        if (!user) {
            // Se o utilizador não existir, cria um novo
            user = new User({
                googleId: payload.sub,
                name: payload.name,
                email: payload.email,
                photo: payload.picture,
            });
            await user.save();
        }

        // 3. Cria um token JWT personalizado para o utilizador
        const jwtToken = jwt.sign(
            { userId: user._id, googleId: user.googleId },
            JWT_SECRET,
            { expiresIn: '1d' } // O token expira em 1 dia
        );

        // Retorna o token para o frontend
        res.status(200).json({ message: 'Login bem-sucedido', token: jwtToken });

    } catch (error) {
        console.error('Erro no login com Google:', error);
        res.status(401).json({ error: 'Falha na autenticação.' });
    }
});

module.exports = router;