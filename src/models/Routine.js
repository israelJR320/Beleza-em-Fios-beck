// src/models/Routine.js
const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
    tipoCabelo: { type: String, required: true },
    objetivos: { type: [String], required: true },
    frequencia: { type: String, required: true },
    condicaoCouroCabeludo: { type: String, required: true },
    espessura: { type: String, required: true },
    danos: { type: [String], required: true },
    duracao: { type: String, required: true },
    rotina: [{
        dia: { type: String, required: true },
        data: { type: Date, required: false },
        tratamento: { type: String, required: true },
        produtos: [{
            tipo: { type: String, required: true },
            descricao: { type: String, required: true },
        }],
        minutos: { type: Number, required: false },
    }],
    produtos: { type: mongoose.Schema.Types.Mixed, required: true },
    generationDate: { type: Date, default: Date.now },
});

const Routine = mongoose.model('Routine', routineSchema);
module.exports = Routine;