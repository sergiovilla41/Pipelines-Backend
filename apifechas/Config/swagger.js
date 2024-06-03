// Config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Opciones de configuración de Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Festivos',
      version: '1.0.0',
      description: 'Documentación de la API de Festivos',
    },
    servers: [
      {
        url: 'http://localhost:3030', // Cambia esto por la URL de tu servidor
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./Rutas/rutes.js'], // Ruta al archivo de rutas que contiene las definiciones Swagger
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
