const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const registryRoutes = require('./routes/registry.routes');
const healthCheck = require('./utils/health-check');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8761;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/eureka', registryRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({
    message: 'Service de registre opérationnel',
    status: 'UP'
  });
});

// Démarrer la vérification de santé périodique
const HEALTH_CHECK_INTERVAL = process.env.HEALTH_CHECK_INTERVAL || 30000;
setInterval(() => {
  healthCheck.checkAllServices();
}, HEALTH_CHECK_INTERVAL);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Service de registre démarré sur le port ${PORT}`);
});