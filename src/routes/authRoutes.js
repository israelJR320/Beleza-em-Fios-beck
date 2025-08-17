// authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const bcrypt = require('bcrypt'); // <-- NOVO: Importação do bcrypt

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

// <-- NOVO: Rota de Registo com Email e Password -->
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // 1. Validação simples
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        // 2. Verifica se o e-mail já está em uso
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Este e-mail já está registado.' });
        }

        // 3. Hashear a palavra-passe antes de guardar
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Cria o novo utilizador no banco de dados
        const newUser = new User({
            name,
            email,
            password: hashedPassword, // Guarda a palavra-passe hasheada
        });
        await newUser.save();

        // 5. Gera um token JWT para o novo utilizador
        const jwtToken = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        // Retorna o token e os dados básicos do utilizador
        res.status(201).json({ 
            message: 'Registo bem-sucedido', 
            token: jwtToken,
            user: { _id: newUser._id, name: newUser.name, email: newUser.email }
        });

    } catch (error) {
        console.error('Erro no registo:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// <-- NOVO: Rota de Login com Email e Password -->
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. Validação simples
    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e palavra-passe são obrigatórios.' });
    }

    try {
        // 2. Procura o utilizador pelo e-mail
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 3. Compara a palavra-passe fornecida com a hasheada no banco de dados
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 4. Gera um token JWT para o utilizador autenticado
        const jwtToken = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Retorna o token e os dados básicos do utilizador
        res.status(200).json({ 
            message: 'Login bem-sucedido', 
            token: jwtToken,
            user: { _id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});


module.exports = router;