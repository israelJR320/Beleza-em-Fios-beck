const mongoose = require('mongoose');

// 🔔 CORRIGIDO: O esquema agora só inclui os campos necessários
const articleRecommendationSchema = new mongoose.Schema({
    hairType: { type: String, required: true },
    goal: { type: String, required: true },
    articles: [String],
    generationDate: { type: Date, default: Date.now }
});

const ArticleRecommendation = mongoose.model('ArticleRecommendation', articleRecommendationSchema);
module.exports = ArticleRecommendation;