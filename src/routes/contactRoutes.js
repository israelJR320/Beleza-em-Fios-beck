const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../services/emailService');

router.post('/', async (req, res) => {
    const { subject, message } = req.body;
    
    // Se o utilizador estiver autenticado, pegamos os dados dele.
    const userName = req.user ? req.user.name : 'Utilizador não autenticado';
    const userEmail = req.user ? req.user.email : 'nao_informado@exemplo.com';

    if (!subject || !message) {
        return res.status(400).json({ error: 'Assunto e mensagem são obrigatórios.' });
    }

    try {
        await sendContactEmail(userEmail, userName, subject, message);
        res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;