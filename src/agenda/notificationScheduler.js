const cron = require('node-cron');
const User = require('../models/User');
const { generateNotification } = require('../services/aiService');
const { sendPushNotification } = require('../services/pushNotificationService');

async function generateAndSendGroupedNotifications() {
    try {
        console.log('A executar a tarefa agendada: gerar e enviar notificações push.');

        // Encontra todos os utilizadores com tokens FCM
        const users = await User.find({ fcmToken: { $ne: null } });

        // Agrupa os utilizadores por tipo de cabelo para otimizar as chamadas à IA
        const usersByHairType = users.reduce((groups, user) => {
            if (user.profile && user.profile.hairType) {
                const hairType = user.profile.hairType;
                if (!groups[hairType]) {
                    groups[hairType] = [];
                }
                groups[hairType].push(user);
            }
            return groups;
        }, {});

        // Itera sobre cada grupo para gerar e enviar uma notificação única
        for (const hairType in usersByHairType) {
            const group = usersByHairType[hairType];
            if (group.length > 0) {
                try {
                    // 1. Gera a mensagem da notificação com a IA apenas UMA VEZ por grupo
                    const notification = await generateNotification(hairType);

                    // 2. Envia a mesma notificação para todos os utilizadores do grupo
                    for (const user of group) {
                        await sendPushNotification(user.fcmToken, notification.title, notification.body);
                        console.log(`Notificação para ${user.email} (Tipo: ${hairType}) enviada.`);
                    }
                } catch (error) {
                    console.error(`Falha ao enviar notificação para o grupo ${hairType}:`, error);
                }
            }
        }
        console.log('Tarefa de notificações push concluída.');
    } catch (error) {
        console.error('Erro geral no agendador de notificações:', error);
    }
}

// =========================================================================
// AGENDAMENTO CRON
// =========================================================================
// O seu agendamento para 11h e 19h
cron.schedule('0 11,19 * * *', () => {
    generateAndSendGroupedNotifications();
}, {
    timezone: "America/Sao_Paulo" // Defina o fuso horário para garantir a hora correta
});

console.log('Agendador de notificações push ativado.');