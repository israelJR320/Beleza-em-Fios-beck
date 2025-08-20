const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { JWT_SECRET } = require('../config/config');

// Inicializa o cliente do Google com o nosso Client ID
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware para verificar se o utilizador já existe por email
const checkExistingUserByEmail = async (email) => {
    return await User.findOne({ email });
};

// Middleware para verificar se o utilizador já existe por googleId
const checkExistingUserByGoogleId = async (googleId) => {
    return await User.findOne({ googleId });
};

// Rota de login com Google
router.post('/google', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token do Google não fornecido.' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture: photoUrl } = payload;

        let user = await checkExistingUserByGoogleId(googleId);

        if (!user) {
            // Verifica se o e-mail já está registado com uma conta local
            const existingUserWithEmail = await checkExistingUserByEmail(email);
            
            if (existingUserWithEmail) {
                // Se o e-mail já existe, liga a conta do Google à conta local
                user = await User.findOneAndUpdate(
                    { email },
                    { googleId, photoUrl },
                    { new: true }
                );
            } else {
                // Se não existir, cria um novo utilizador
                user = new User({
                    googleId,
                    name,
                    email,
                    photoUrl,
                });
                await user.save();
            }
        }

        const jwtToken = jwt.sign(
            { userId: user._id, googleId: user.googleId },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ message: 'Login bem-sucedido', token: jwtToken });

    } catch (error) {
        console.error('Erro no login com Google:', error);
        res.status(401).json({ error: 'Falha na autenticação.' });
    }
});

// Rota de Registo com Email e Password
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        let existingUser = await checkExistingUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Este e-mail já está registado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });
        await newUser.save();

        const jwtToken = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
        
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

// Rota de Login com Email e Password
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e palavra-passe são obrigatórios.' });
    }

    try {
        // ✅ ALTERADO: Adicionado `.select('+password')` para garantir que a password seja carregada.
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // ✅ ALTERADO: Adicionado uma verificação para garantir que o campo 'password' existe no objeto 'user'.
        if (!user.password) {
            console.error('Utilizador encontrado, mas o campo de password está vazio.');
            return res.status(500).json({ error: 'Erro interno do servidor: password não encontrada.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const jwtToken = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

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