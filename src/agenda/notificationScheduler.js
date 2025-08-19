const cron = require('node-cron');
const User = require('./models/User');
const { generateNotification } = require('./services/aiService');
const { sendPushNotification } = require('./services/pushNotificationService');

async function generateAndSendGroupedNotifications() {
    try {
        console.log('A executar a tarefa agendada: gerar e enviar notificações push.');

        const users = await User.find({ pushNotificationsEnabled: true, fcmToken: { $ne: null }, 'profile.hairType': { $ne: null } });

        const usersByHairType = users.reduce((groups, user) => {
            const hairType = user.profile.hairType;
            if (!groups[hairType]) {
                groups[hairType] = [];
            }
            groups[hairType].push(user);
            return groups;
        }, {});

        for (const hairType in usersByHairType) {
            const group = usersByHairType[hairType];
            if (group.length > 0) {
                try {
                    const notification = await generateNotification(hairType);

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

// 🔔 CORRIGIDO: O agendamento agora usa a função otimizada
cron.schedule('0 11,19 * * *', () => {
    generateAndSendGroupedNotifications();
}, {
    timezone: "America/Sao_Paulo"
});

console.log('Agendador de notificações push ativado.');

module.exports = {
    generateAndSendGroupedNotifications,
};