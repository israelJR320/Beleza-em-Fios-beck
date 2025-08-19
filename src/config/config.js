// src/config/config.js
require('dotenv').config();

module.exports = {
  // A chave para assinar os teus tokens JWT
  JWT_SECRET: process.env.JWT_SECRET ,
  // O ID do cliente do Google para autenticação
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  // A tua URI de conexão do MongoDB
  MONGODB_URI: process.env.MONGODB_URI
};