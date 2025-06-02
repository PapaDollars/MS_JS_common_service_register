const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const winston = require('winston');
const registryRoutes = require('./routes/registry.routes');
const axios = require('axios');
const { loggerMiddleware } = require('./middleware/logger.middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8761;
const CONFIG_SERVICE_URL = process.env.CONFIG_SERVICE_URL || 'http://localhost:8888';

// Configuration du logger
const loggerWinston = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/registry', registryRoutes);

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, async () => {
  loggerWinston.info(`Service Register démarré sur le port ${PORT}`);
  
  // S'enregistrer auprès du service de configuration
  try {
    await axios.post(`${CONFIG_SERVICE_URL}/api/config/register`, {
      name: 'service-register',
      host: 'localhost',
      port: PORT,
      healthUrl: `http://localhost:${PORT}/health`
    });
    loggerWinston.info('Enregistré avec succès auprès du service de configuration');
  } catch (error) {
    loggerWinston.error('Erreur lors de l\'enregistrement auprès du service de configuration', error);
  }
});