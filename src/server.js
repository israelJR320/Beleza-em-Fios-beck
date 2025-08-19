const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const authMiddleware = require('./middleware/authMiddleware');

// --- Importações das Rotas ---
const careRoutes = require('./routes/careRoutes');
const cronogramaCapilarRoutes = require('./routes/cronogramaCapilar');
const artigosRecomendadosRoutes = require('./routes/artigosRecomendados');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const scheduler = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Configuração dos Middlewares ---
app.use(express.json());
app.use(cors());

// --- Rotas Públicas ---
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

// --- Rotas Protegidas ---
app.use('/api/cronograma-capilar', authMiddleware, cronogramaCapilarRoutes);
app.use('/api/artigos-recomendados', authMiddleware, artigosRecomendadosRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/cuidados-diarios', authMiddleware, careRoutes);
app.use('/api/user', authMiddleware, userRoutes);

// 🔔 CORRIGIDO: A rota photoRoutes foi removida, pois a sua lógica foi consolidada em aiRoutes.
// Remove a linha 'app.use('/api/photo', authMiddleware, photoRoutes);'

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Servidor Beleza em Fios está a funcionar!' });
});

// Função de inicialização
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Servidor a correr em http://localhost:${PORT}`);
        });

        // 🔔 CORRIGIDO: Apenas importa o agendador; ele se inicia sozinho
        // O ficheiro scheduler.js já tem a lógica para iniciar a tarefa.
    } catch (error) {
        console.error('Falha ao iniciar o servidor:', error);
    }
};

startServer();