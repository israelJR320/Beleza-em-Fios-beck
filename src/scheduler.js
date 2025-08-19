const cron = require('node-cron');
const User = require('./models/User'); // Importa o modelo de utilizador
const { generateAiPushNotification } = require('./services/aiService'); // Importa o serviço de IA para notificação
const { sendPushNotification } = require('./services/pushNotificationService'); // Você precisará criar este serviço

/**
 * Função principal para gerar e enviar as notificações.
 */
async function generateAndSendNotifications() {
    try {
        console.log('A executar a tarefa agendada: gerar e enviar notificações push.');

        // 1. Encontrar todos os utilizadores que ativaram as notificações
        const users = await User.find({ pushNotificationsEnabled: true });

        // 2. Iterar sobre cada utilizador para gerar e enviar a notificação
        for (const user of users) {
            // Verifica se o utilizador tem um token FCM
            if (!user.fcmToken) {
                console.log(`Utilizador ${user.name} não tem um token FCM. A ignorar.`);
                continue;
            }

            // Garante que o perfil do utilizador tem o tipo de cabelo
            if (!user.profile || !user.profile.hairType) {
                console.log(`Perfil do utilizador ${user.name} incompleto. A ignorar.`);
                continue;
            }

            try {
                // 3. Gerar a notificação push usando a IA, com base no tipo de cabelo
                const notificationText = await generateAiPushNotification(user.profile.hairType);
                
                // 4. Enviar a notificação push
                await sendPushNotification(user.fcmToken, 'Beleza em Fios', notificationText);

                console.log(`Notificação enviada com sucesso para ${user.email}`);

            } catch (error) {
                console.error(`Falha ao enviar notificação para ${user.email}:`, error);
            }
        }
        
        console.log('Tarefa de notificações concluída.');

    } catch (error) {
        console.error('Erro geral no agendador de notificações:', error);
    }
}

// =========================================================================
// AGENDAMENTO CRON
// =========================================================================

// 🔔 CORRIGIDO: Agenda a tarefa para ser executada duas vezes ao dia, às 11:00 e às 19:00
const scheduledJob = cron.schedule('0 11,19 * * *', () => {
    generateAndSendNotifications();
});

console.log('Agendador de notificações ativado.');

// 🔔 CORRIGIDO: Exporta a função principal e o agendamento
module.exports = {
    generateAndSendNotifications,
    scheduledJob,
};