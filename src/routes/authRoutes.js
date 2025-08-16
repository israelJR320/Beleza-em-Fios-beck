const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

require('dotenv').config();

// Inicializa o cliente do Google com o nosso Client ID
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'uma_chave_secreta_muito_forte';

// =========================================================================
// ROTA DE TESTE TEMPORÁRIA: GERA UM TOKEN JWT PARA FINS DE DESENVOLVIMENTO
// REMOVA ESTE CÓDIGO APÓS FINALIZAR OS TESTES!
// =========================================================================

// Esta rota de teste busca um utilizador pelo e-mail e gera um token JWT.
// Isso permite que você teste as rotas protegidas sem precisar de um token do Google.
router.get('/test-token', async (req, res) => {
    try {
        // --- INFORMAÇÃO IMPORTANTE ---
        // SUBSTITUA 'seu-email-aqui' pelo email de um utilizador existente no seu MongoDB.
        // Se você não tiver utilizadores, pode criar um manualmente para testes.
        const user = await User.findOne({ email: 'joao.silva@exemplo.com' }); 
        
        if (!user) {
            return res.status(404).json({ message: 'Utilizador de teste não encontrado. Por favor, crie um ou use um e-mail existente.' });
        }

        // Gera um token JWT usando as informações do utilizador de teste
        const testToken = jwt.sign(
            { userId: user._id, googleId: user.googleId },
            JWT_SECRET,
            { expiresIn: '1d' } // O token expira em 1 dia
        );

        res.status(200).json({ message: 'Token de teste gerado com sucesso.', token: testToken });
    } catch (error) {
        console.error('Erro ao gerar token de teste:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// =========================================================================
// FIM DA ROTA DE TESTE
// =========================================================================


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