const ServiceModel = require('../models/service.model');

// Enregistrer un nouveau service
exports.registerService = (req, res) => {
  const serviceInfo = req.body;
  
  if (!serviceInfo.name || !serviceInfo.instanceId || !serviceInfo.url) {
    return res.status(400).json({
      message: 'Informations incomplètes. name, instanceId et url sont requis.'
    });
  }
  
  const registeredService = ServiceModel.register(serviceInfo);
  
  res.status(201).json({
    message: 'Service enregistré avec succès',
    service: registeredService
  });
};

// Désenregistrer un service
exports.deregisterService = (req, res) => {
  const { name, instanceId } = req.params;
  
  const success = ServiceModel.deregister(name, instanceId);
  
  if (!success) {
    return res.status(404).json({
      message: `Service ${name} avec l'instance ${instanceId} non trouvé`
    });
  }
  
  res.json({
    message: `Service ${name} avec l'instance ${instanceId} désenregistré avec succès`
  });
};

// Heartbeat pour un service
exports.heartbeat = (req, res) => {
  const { name, instanceId } = req.params;
  
  const success = ServiceModel.heartbeat(name, instanceId);
  
  if (!success) {
    return res.status(404).json({
      message: `Service ${name} avec l'instance ${instanceId} non trouvé`
    });
  }
  
  res.json({
    message: 'Heartbeat reçu'
  });
};

// Mettre à jour le statut d'un service
exports.updateStatus = (req, res) => {
  const { name, instanceId } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({
      message: 'Le statut est requis'
    });
  }
  
  const updatedService = ServiceModel.updateStatus(name, instanceId, status);
  
  if (!updatedService) {
    return res.status(404).json({
      message: `Service ${name} avec l'instance ${instanceId} non trouvé`
    });
  }
  
  res.json({
    message: `Statut mis à jour pour ${name} (${instanceId})`,
    service: updatedService
  });
};

// Obtenir tous les services
exports.getAllServices = (req, res) => {
  const services = ServiceModel.getAllServices();
  
  res.json({
    services
  });
};

// Obtenir toutes les instances d'un service
exports.getServiceInstances = (req, res) => {
  const { name } = req.params;
  
  const instances = ServiceModel.getServiceInstances(name);
  
  if (instances.length === 0) {
    return res.status(404).json({
      message: `Aucune instance trouvée pour le service ${name}`
    });
  }
  
  res.json({
    service: name,
    instances
  });
};