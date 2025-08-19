const mongoose = require('mongoose');

// Define um esquema para o clima
const weatherSchema = new mongoose.Schema({
    temperature: Number,
    humidity: Number,
    condition: String,
});

// 🔔 NOVO: Esquema para o conteúdo gerado pela IA
const aiContentSchema = new mongoose.Schema({
    tip: String,
    alerts: [String],
    articles: [String],
});

// Esquema unificado para as dicas e alertas diários
const dailyContentSchema = new mongoose.Schema({
    hairType: {
        type: String,
        required: true,
    },
    goal: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    weather: weatherSchema,
    content: aiContentSchema,
    generationDate: {
        type: Date,
        default: Date.now,
    },
});

// Cria o modelo a partir do schema
const DailyContent = mongoose.model('DailyContent', dailyContentSchema);

module.exports = DailyContent;