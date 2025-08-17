require('dotenv').config({ path: './.env' });
console.log("DEBUG VAR:", process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? "OK" : "NÃO ENCONTRADA");const { sendPushNotification } = require('./src/services/pushNotificationService');

// Substitua pelo token FCM de um dispositivo real para teste
const testToken = 'SEU_FCM_TOKEN_AQUI';

const title = 'Teste de Notificação';
const body = 'Esta é uma notificação enviada localmente.';

sendPushNotification(testToken, title, body)
  .then(() => console.log('Teste finalizado com sucesso.'))
  .catch(err => console.error('Erro no teste:', err.message));
