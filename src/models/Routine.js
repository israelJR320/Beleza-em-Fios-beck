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
    goal: { type: String, required: true },
    frequency: { type: String, required: true }, // adicionado para manter consistência
    scalp: { type: String, required: true },     // adicionado para manter consistência
    hairThickness: { type: String, required: true }, // adicionado para manter consistência
    hairDamage: { type: String, required: true },    // adicionado para manter consistência
    duration: { type: String }, // duração total do cronograma, ex: "3 semanas"
    generationDate: { type: Date, default: Date.now },
    steps: [stepSchema],
    products: [productSchema] // ATUALIZADO: agora suporta type e description
});

const Routine = mongoose.model('Routine', routineSchema);
module.exports = Routine;
