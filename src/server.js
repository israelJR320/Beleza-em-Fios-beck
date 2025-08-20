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

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

app.use('/api/cronograma-capilar', authMiddleware, cronogramaCapilarRoutes);
app.use('/api/artigos-recomendados', authMiddleware, artigosRecomendadosRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/cuidados-diarios', authMiddleware, careRoutes);
app.use('/api/user', authMiddleware, userRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Servidor Beleza em Fios está a funcionar!' });
});

// ✅ Opção 2: Adicionar uma rota /health no backend (server.js)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Servidor está saudável!' });
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Servidor a correr na porta ${PORT}`);
        });

        scheduler.generateAndSendGroupedNotifications();

    } catch (error) {
        console.error('Falha ao iniciar o servidor:', error);
    }
};

startServer();