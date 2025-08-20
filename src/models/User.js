const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // ID único fornecido pelo Google
    googleId: {
        type: String,
        // 🔔 CORRIGIDO: Este campo não é mais obrigatório
        required: false,
        unique: true,
        sparse: true,
    },
    // Nome do utilizador
    name: {
        type: String,
        required: true,
    },
    // E-mail do utilizador
    email: {
        type: String,
        required: true,
        unique: true,
    },
    // ✅ Adicionado: Campo para guardar a senha encriptada do utilizador
    password: {
        type: String,
        required: false, // 🔔 CORRIGIDO: Não é obrigatório pois o login com Google não usa senha
    },
    // Foto de perfil do Google (opcional)
    photo: {
        type: String,
    },
    // Dados do perfil (adicionados posteriormente)
    profile: {
        age: Number,
        gender: String,
        hairType: String,
        goal: String,
    },
    points: { // NOVO: Pontuação do jogo
        type: Number,
        default: 0,
    },
    dailyQuestionsUsed: { // NOVO: Contador de perguntas diárias
        type: Number,
        default: 0,
    },
    lastQuestionDate: { // NOVO: Data da última pergunta para reset diário
        type: Date,
        default: null,
    },
    weeklyVerificationsUsed: { // NOVO: Contador de verificações de fotos
        type: Number,
        default: 0,
    },
    lastVerificationDate: { // NOVO: Data da última verificação para reset semanal
        type: Date,
        default: null,
    },
    // Data de criação do utilizador
    createdAt: {
        type: Date,
        default: Date.now,
    },
    fcmToken: {
        type: String,
        default: null,
    },
    pushNotificationsEnabled: {
        type: Boolean,
        default: true, // Por padrão, as notificações vêm ativadas
    },
});

// ✅ Adicionado: Método para esconder a senha do objeto ao ser convertido para JSON
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // ID único fornecido pelo Google
    googleId: {
        type: String,
        // 🔔 CORRIGIDO: Este campo não é mais obrigatório
        required: false,
        unique: true,
        sparse: true,
    },
    // Nome do utilizador
    name: {
        type: String,
        required: true,
    },
    // E-mail do utilizador
    email: {
        type: String,
        required: true,
        unique: true,
    },
    // ✅ Adicionado: Campo para guardar a senha encriptada do utilizador
    password: {
        type: String,
        required: false, // 🔔 CORRIGIDO: Não é obrigatório pois o login com Google não usa senha
    },
    // Foto de perfil do Google (opcional)
    photo: {
        type: String,
    },
    // Dados do perfil (adicionados posteriormente)
    profile: {
        age: Number,
        gender: String,
        hairType: String,
        goal: String,
    },
    points: { // NOVO: Pontuação do jogo
        type: Number,
        default: 0,
    },
    dailyQuestionsUsed: { // NOVO: Contador de perguntas diárias
        type: Number,
        default: 0,
    },
    lastQuestionDate: { // NOVO: Data da última pergunta para reset diário
        type: Date,
        default: null,
    },
    weeklyVerificationsUsed: { // NOVO: Contador de verificações de fotos
        type: Number,
        default: 0,
    },
    lastVerificationDate: { // NOVO: Data da última verificação para reset semanal
        type: Date,
        default: null,
    },
    // Data de criação do utilizador
    createdAt: {
        type: Date,
        default: Date.now,
    },
    fcmToken: {
        type: String,
        default: null,
    },
    pushNotificationsEnabled: {
        type: Boolean,
        default: true, // Por padrão, as notificações vêm ativadas
    },
});

// ✅ Adicionado: Método para esconder a senha do objeto ao ser convertido para JSON
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;