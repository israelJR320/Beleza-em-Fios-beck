const jwt = require('jsonwebtoken');
const User = require('../models/User');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'uma_chave_secreta_muito_forte';

const authMiddleware = async (req, res, next) => {
    // Tenta pegar o token do cabeçalho de autorização
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 1. Verifica se o token é válido
        const decoded = jwt.verify(token, JWT_SECRET);

        // 2. Procura o utilizador no banco de dados
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Acesso negado. Utilizador não encontrado.' });
        }

        // 3. Adiciona o utilizador à requisição para ser usado nas rotas
        req.user = user;
        next(); // Permite que a requisição continue
    } catch (error) {
        console.error('Erro na verificação do token:', error);
        return res.status(401).json({ error: 'Token inválido.' });
    }
};

module.exports = authMiddleware;