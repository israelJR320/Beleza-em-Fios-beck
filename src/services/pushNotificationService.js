const admin = require('firebase-admin');
require('dotenv').config();

// Lê o conteúdo JSON da chave de serviço a partir da variável de ambiente
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

// 🔔 CORRIGIDO: O código de inicialização do Firebase está agora no serviço
if (!admin.apps.length) {
    if (!serviceAccountKey) {
        console.error('ERRO: Variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não definida.');
        process.exit(1);
    }
    
    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Conectado ao Firebase com sucesso.');
    } catch (error) {
        console.error('Erro ao inicializar o Firebase:', error.message);
        process.exit(1);
    }
}

/**
 * @function sendPushNotification
 * @description Envia uma notificação push para um utilizador específico.
 * @param {string} fcmToken - O token do dispositivo para onde a notificação será enviada.
 * @param {string} messageTitle - O título da notificação.
 * @param {string} messageBody - O corpo da notificação.
 */
async function sendPushNotification(fcmToken, messageTitle, messageBody) {
    const message = {
        notification: {
            title: messageTitle,
            body: messageBody,
        },
        token: fcmToken,
    };

    try {
        await admin.messaging().send(message);
        console.log('Notificação enviada com sucesso para o token:', fcmToken);
    } catch (error) {
        console.error('Erro ao enviar notificação push:', error);
        throw new Error('Falha ao enviar a notificação.');
    }
}

module.exports = { sendPushNotification };