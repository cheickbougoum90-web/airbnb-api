// server.js
// Point d'entrée — démarre toute l'application

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./config/database');
const listings   = require('./routes/listings');

// 1. Connexion à MongoDB Atlas
connectDB();

// 2. Créer l'application Express
const app = express();

// 3. Middlewares
app.use(cors());
app.use(express.json());

// 4. Route de santé — teste que le serveur tourne
app.get('/', (req, res) => {
  res.json({
    message: '🏠 Airbnb API — opérationnelle',
    routes: ['/api/listings', '/api/listings/stats']
  });
});

// 5. Brancher les routes listings
app.use('/api/listings', listings);

// 6. Gérer les routes inexistantes (404)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable' });
});

// 7. Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});