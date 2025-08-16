import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Teste de rota
app.get('/', (req, res) => {
  res.send('Backend Beleza em Fios funcionando!');
});

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI || '', {
})
.then(() => console.log('MongoDB conectado!'))
.catch((err) => console.log('Erro MongoDB:', err));

// Inicia servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
