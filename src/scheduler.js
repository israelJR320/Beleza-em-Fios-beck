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
                await sendPushNotification(user.fcmToken, notificationText);

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

// Agenda a tarefa para ser executada todos os dias às 9:00 da manhã
// Sintaxe cron: 'minuto hora dia_do_mes mes dia_da_semana'
// A expressão '0 9 * * *' significa:
// * 0: No minuto 0 da hora
// * 9: Na hora 9 (9 da manhã)
// * *: Em qualquer dia do mês
// * *: Em qualquer mês
// * *: Em qualquer dia da semana
cron.schedule('0 9 * * *', () => {
    generateAndSendNotifications();
});

console.log('Agendador de notificações ativado.');