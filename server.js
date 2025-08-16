const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/db');
const authMiddleware = require('./src/middleware/authMiddleware'); // Importa o middleware de autenticação

// --- Importações das Rotas ---
const careRoutes = require('./src/routes/careRoutes');
const cronogramaCapilarRoutes = require('./src/routes/cronogramaCapilar');
const artigosRecomendadosRoutes = require('./src/routes/artigosRecomendados');
const authRoutes = require('./src/routes/authRoutes');
const aiRoutes = require('./src/routes/aiRoutes'); // Importa a nova rota de perguntas à IA
const photoRoutes = require('./src/routes/photoRoutes'); // NOVO: Importa a rota de fotos
const userRoutes = require('./src/routes/userRoutes'); // NOVO: Importa a rota de utilizadores
const contactRoutes = require('./src/routes/contactRoutes'); // NOVO

// Conecta à base de dados
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Configuração dos Middlewares ---
app.use(express.json());
app.use(cors());

// --- Rotas de Autenticação (não precisam de proteção) ---
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes); // Rota de contato é pública

// --- Rotas Protegidas (exigem o middleware de autenticação) ---
app.use('/api/cronograma-capilar', authMiddleware, cronogramaCapilarRoutes);
app.use('/api/artigos-recomendados', authMiddleware, artigosRecomendadosRoutes);
app.use('/api/cuidados-diarios', authMiddleware, careRoutes);
app.use('/api/ai', authMiddleware, aiRoutes); // Protege a nova rota
app.use('/api/photo', authMiddleware, photoRoutes); // NOVO: Protege a rota de fotos
app.use('/api/user', authMiddleware, userRoutes); // NOVO: Protege a rota de utilizadores

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Servidor Beleza em Fios está a funcionar!' });
});

// --- Iniciar o Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});