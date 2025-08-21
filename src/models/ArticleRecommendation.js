const mongoose = require('mongoose');

// 🔔 CORRIGIDO: O esquema agora só inclui os campos necessários
const articleRecommendationSchema = new mongoose.Schema({
    tipoCabelo: { type: String, required: true },
    objetivos: { type: String, required: true },
    articles: [String],
    generationDate: { type: Date, default: Date.now }
});

const ArticleRecommendation = mongoose.model('ArticleRecommendation', articleRecommendationSchema);
module.exports = ArticleRecommendation;