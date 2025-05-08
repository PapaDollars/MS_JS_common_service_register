const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const winston = require('winston');
const registryRoutes = require('./routes/registry.routes');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;
const CONFIG_SERVICE_URL = process.env.CONFIG_SERVICE_URL || 'http://localhost:8001';

// Configuration du logger
const logger = winston.createLogger({
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

// Routes
app.use('/api/registry', registryRoutes);

// Démarrage du serveur
app.listen(PORT, async () => {
  logger.info(`Service Register démarré sur le port ${PORT}`);
  
  // S'enregistrer auprès du service de configuration
  try {
    await axios.post(`${CONFIG_SERVICE_URL}/api/config/register`, {
      name: 'service-register',
      host: 'localhost',
      port: PORT,
      healthUrl: `http://localhost:${PORT}/api/registry/health`
    });
    logger.info('Enregistré avec succès auprès du service de configuration');
  } catch (error) {
    logger.error('Erreur lors de l\'enregistrement auprès du service de configuration', error);
  }
});