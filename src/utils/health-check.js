const axios = require('axios');
const ServiceModel = require('../models/service.model');

/**
 * Utilitaire de vérification de santé des services
 */
const healthCheck = {
  /**
   * Vérifier la santé d'un service spécifique
   * @param {Object} service - Service à vérifier
   * @returns {Promise} Statut de santé du service
   */
  async checkService(service) {
    try {
      const { name, instanceId, url, port } = service;
      const healthUrl = `${url}:${port}/health`;
      
      const response = await axios.get(healthUrl, { timeout: 5000 });
      
      if (response.status === 200) {
        ServiceModel.updateStatus(name, instanceId, response.data.status || 'UP');
        return true;
      } else {
        ServiceModel.updateStatus(name, instanceId, 'DOWN');
        return false;
      }
    } catch (error) {
      console.error(`Erreur lors de la vérification de santé pour ${service.name}:`, error.message);
      ServiceModel.updateStatus(service.name, service.instanceId, 'DOWN');
      return false;
    }
  },
  
  /**
   * Vérifier la santé de tous les services enregistrés
   */
  async checkAllServices() {
    console.log('Vérification de la santé des services...');
    
    const allServices = ServiceModel.getAllServices();
    
    for (const [name, instances] of Object.entries(allServices)) {
      for (const instance of instances) {
        await this.checkService(instance);
      }
    }
    
    // Nettoyer les services inactifs (sans heartbeat depuis 60 secondes)
    const removedServices = ServiceModel.cleanupStaleServices(60000);
    
    if (removedServices.length > 0) {
      console.log(`${removedServices.length} services inactifs supprimés`);
    }
  }
};

module.exports = healthCheck;