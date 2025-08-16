const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendContactEmail(userEmail, userName, subject, message) {
    const mailOptions = {
        from: userEmail,
        to: process.env.DESTINATION_EMAIL,
        subject: `[Contato - Beleza em Fios] ${subject} - de ${userName}`,
        html: `<p><strong>Nome:</strong> ${userName}</p>
               <p><strong>Email:</strong> ${userEmail}</p>
               <p><strong>Mensagem:</strong></p>
               <p>${message}</p>`,
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