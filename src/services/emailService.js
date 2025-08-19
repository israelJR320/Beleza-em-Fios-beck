const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * @function sendContactEmail
 * @description Envia um e-mail de contato do utilizador para o endereço de destino.
 * @param {string} userEmail - O e-mail do remetente.
 * @param {string} userName - O nome do remetente.
 * @param {string} subject - O assunto da mensagem.
 * @param {string} message - O corpo da mensagem.
 */
async function sendContactEmail(userEmail, userName, subject, message) {
    const mailOptions = {
        from: `"${userName}" <${userEmail}>`, // 🔔 MELHORIA: Formato de remetente mais profissional
        to: process.env.DESTINATION_EMAIL,
        subject: `[Contato - Beleza em Fios] ${subject}`,
        html: `
            <p><strong>Nome:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Assunto:</strong> ${subject}</p>
            <hr />
            <p><strong>Mensagem:</strong></p>
            <p>${message}</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('E-mail de contato enviado com sucesso.');
    } catch (error) {
        console.error('Erro ao enviar e-mail de contato:', error);
        throw new Error('Falha ao enviar o e-mail de contato.');
    }
}

module.exports = { sendContactEmail };