// src/services/pushNotificationService.js

const admin = require('firebase-admin');

// Carrega as variáveis de ambiente
require('dotenv').config();

// Configura o Firebase Admin SDK com as credenciais do seu projeto
// O arquivo serviceAccountKey.json deve ser gerado no console do Firebase
// e o caminho deve ser configurado como uma variável de ambiente.
// Exemplo no .env: FIREBASE_SERVICE_ACCOUNT_PATH=/caminho/para/seu/serviceAccountKey.json
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
    console.error('ERRO: Variável de ambiente FIREBASE_SERVICE_ACCOUNT_PATH não definida.');
    process.exit(1); // Encerra a aplicação
}

try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Conectado ao Firebase com sucesso.');
} catch (error) {
    console.error('Erro ao inicializar o Firebase:', error.message);
    console.error('Verifique se o caminho para o arquivo da conta de serviço está correto.');
    process.exit(1); // Encerra a aplicação
}

/**
 * Envia uma notificação push para um único dispositivo.
 * @param {string} fcmToken - O token do dispositivo para o qual a notificação será enviada.
 * @param {string} messageText - O texto da notificação a ser exibido.
 * @returns {Promise<void>}
 */
async function sendPushNotification(fcmToken, messageText) {
    // Configura os detalhes da mensagem
    const message = {
        notification: {
            title: 'Beleza em Fios',
            body: messageText,
        },
        token: fcmToken,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Notificação enviada com sucesso:', response);
    } catch (error) {
        console.error('Erro ao enviar notificação push:', error);
        throw new Error('Falha ao enviar a notificação.');
    }
}

// Exporte a função para que possa ser usada em outros arquivos
module.exports = { sendPushNotification };