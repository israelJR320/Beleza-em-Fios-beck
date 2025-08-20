const mongoose = require('mongoose');

// ATUALIZADO: stepSchema agora inclui treatment, minutes e array de products
const stepSchema = new mongoose.Schema({
    day: { type: String, required: true }, // ex: Monday, Tuesday
    treatment: { type: String, required: true }, // hidratação, nutrição, reconstrução
    minutes: { type: Number, required: true }, // duração do tratamento
    products: [{ type: String }] // referência às chaves do objeto 'products'
});

// ATUALIZADO: products agora é um objeto com type e description
const productSchema = new mongoose.Schema({
    key: { type: String, required: true }, // ex: "shampoo", "mask_hidration"
    type: { type: String, required: true },
    description: { type: String, required: true }
});

const routineSchema = new mongoose.Schema({
    hairType: { type: String, required: true },
    goal: { type: [String], required: true }, // ✅ CORRIGIDO: Agora é um array de strings
    frequency: { type: String, required: true },
    scalp: { type: String, required: true },
    hairThickness: { type: String, required: true },
    hairDamage: { type: [String], required: true }, // ✅ CORRIGIDO: Agora é um array de strings
    duration: { type: String, required: true },
    steps: [{ // A sua rotina é um array de passos
        day: { type: String, required: true },
        date: { type: Date, required: false },
        treatment: { type: String, required: true },
        products: { type: [String], required: false },
        minutes: { type: Number, required: false },
    }],
    products: { type: mongoose.Schema.Types.Mixed, required: true },
    generationDate: { type: Date, default: Date.now },
});

const Routine = mongoose.model('Routine', routineSchema);
module.exports = Routine;
