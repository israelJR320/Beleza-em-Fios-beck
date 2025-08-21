const mongoose = require('mongoose');

// Função para conectar à base de dados
const connectDB = async () => {
    try {
        // Usa a URL de conexão do MongoDB que está no arquivo .env
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
        // Termina a aplicação em caso de erro
        process.exit(1);
    }
};

module.exports = connectDB;


