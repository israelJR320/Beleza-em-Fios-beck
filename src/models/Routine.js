const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
    day: { type: String, required: true },
    time: { type: String, required: true },
    activity: { type: String, required: true },
    product: { type: String },
});

const routineSchema = new mongoose.Schema({
    hairType: { type: String, required: true },
    goal: { type: String, required: true },
    duration: { type: String }, // agora salva duração
    generationDate: { type: Date, default: Date.now },
    steps: [stepSchema],
    products: [String],
});

const Routine = mongoose.model('Routine', routineSchema);
module.exports = Routine;
