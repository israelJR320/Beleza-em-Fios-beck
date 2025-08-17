const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountKey) {
  console.error('ERRO: Variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não definida.');
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