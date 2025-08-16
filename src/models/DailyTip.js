const mongoose = require('mongoose');

// Define a estrutura (schema) para o documento de dicas diárias
const dailyTipSchema = new mongoose.Schema({
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
    weather: {
        temperature: Number,
        humidity: Number,
        condition: String,
    },
    generationDate: {
        type: Date,
        default: Date.now,
    },
    content: {
        tip: String,
        alerts: [String],
        articles: [String],
    },
});

// Cria o modelo a partir do schema
const DailyTip = mongoose.model('DailyTip', dailyTipSchema);

module.exports = DailyTip;