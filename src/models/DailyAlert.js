const mongoose = require('mongoose');

const dailyAlertSchema = new mongoose.Schema({
    hairType: { type: String, required: true },
    goal: { type: String, required: true },
    city: { type: String, required: true },
    weather: {
        temperature: Number,
        humidity: Number,
        condition: String
    },
    alerts: [String],
    generationDate: { type: Date, default: Date.now }
});

const DailyAlert = mongoose.model('DailyAlert', dailyAlertSchema);
module.exports = DailyAlert;
