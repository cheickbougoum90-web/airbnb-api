// config/database.js
// Ce fichier gère la connexion à MongoDB Atlas

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connecté à MongoDB : ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur connexion : ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;