const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔔 CORRIGIDO: Importa a chave secreta do ficheiro de configuração
const { JWT_SECRET } = require('../config/config');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Acesso negado. Utilizador não encontrado.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Erro na verificação do token:', error);
        return res.status(401).json({ error: 'Token inválido.' });
    }
};

module.exports = authMiddleware;