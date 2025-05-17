const services = {};

/**
 * Modèle pour gérer les services enregistrés
 */
const ServiceModel = {
  /**
   * Enregistrer un nouveau service
   * @param {Object} service - Informations du service
   * @returns {Object} Service enregistré
   */
  register(service) {
    const { name, instanceId, url, port, status = 'UP', metadata = {} } = service;
    
    if (!services[name]) {
      services[name] = {};
    }
    
    services[name][instanceId] = {
      instanceId,
      name,
      url,
      port,
      status,
      metadata,
      lastHeartbeat: Date.now()
    };
    
    return services[name][instanceId];
  },
  
  /**
   * Mettre à jour le statut d'un service
   * @param {string} name - Nom du service
   * @param {string} instanceId - ID de l'instance
   * @param {string} status - Nouveau statut
   * @returns {Object|null} Service mis à jour ou null si non trouvé
   */
  updateStatus(name, instanceId, status) {
    if (services[name] && services[name][instanceId]) {
      services[name][instanceId].status = status;
      services[name][instanceId].lastHeartbeat = Date.now();
      return services[name][instanceId];
    }
    return null;
  },
  
  /**
   * Supprimer un service du registre
   * @param {string} name - Nom du service
   * @param {string} instanceId - ID de l'instance
   * @returns {boolean} Succès de la suppression
   */
  deregister(name, instanceId) {
    if (services[name] && services[name][instanceId]) {
      delete services[name][instanceId];
      
      // Si plus aucune instance pour ce service, supprimer l'entrée
      if (Object.keys(services[name]).length === 0) {
        delete services[name];
      }
      
      return true;
    }
    return false;
  },
  
  /**
   * Obtenir toutes les instances d'un service
   * @param {string} name - Nom du service
   * @returns {Array} Instances du service
   */
  getServiceInstances(name) {
    if (services[name]) {
      return Object.values(services[name]);
    }
    return [];
  },
  
  /**
   * Obtenir tous les services enregistrés
   * @returns {Object} Tous les services
   */
  getAllServices() {
    const result = {};
    
    for (const [name, instances] of Object.entries(services)) {
      result[name] = Object.values(instances);
    }
    
    return result;
  },
  
  /**
   * Enregistrer un heartbeat pour un service
   * @param {string} name - Nom du service
   * @param {string} instanceId - ID de l'instance
   * @returns {boolean} Succès de l'opération
   */
  heartbeat(name, instanceId) {
    if (services[name] && services[name][instanceId]) {
      services[name][instanceId].lastHeartbeat = Date.now();
      return true;
    }
    return false;
  },
  
  /**
   * Nettoyer les services inactifs
   * @param {number} timeout - Délai en ms après lequel un service est considéré inactif
   * @returns {Array} Services supprimés
   */
  cleanupStaleServices(timeout = 60000) {
    const now = Date.now();
    const removedServices = [];
    
    for (const [name, instances] of Object.entries(services)) {
      for (const [instanceId, instance] of Object.entries(instances)) {
        if (now - instance.lastHeartbeat > timeout) {
          this.deregister(name, instanceId);
          removedServices.push({ name, instanceId });
        }
      }
    }
    
    return removedServices;
  }
};

module.exports = ServiceModel;