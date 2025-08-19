const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../services/emailService');
const authMiddleware = require('../middleware/authMiddleware');

// 🔔 CORRIGIDO: Adiciona o middleware 'auth' para proteger a rota
router.post('/', authMiddleware, async (req, res) => {
    const { subject, message } = req.body;
    
    // 🔔 MELHORIA: O middleware 'auth' garante que req.user existe.
    // Agora podemos assumir que o utilizador está autenticado.
    const userName = req.user.name;
    const userEmail = req.user.email;

    if (!subject || !message) {
        return res.status(400).json({ error: 'Assunto e mensagem são obrigatórios.' });
    }

    try {
        await sendContactEmail(userEmail, userName, subject, message);
        res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar e-mail de contacto:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;