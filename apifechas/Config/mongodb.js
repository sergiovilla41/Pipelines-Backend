const { MongoClient } = require('mongodb');

// URL de conexión a MongoDB
const uri = 'mongodb://mongodb:27017';
// const uri = 'mongodb://localhost:27017';
const dbName = 'festivos';

// Opciones de configuración para la conexión a MongoDB
const options = {
 
};

// Función para conectar a la base de datos
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(uri, options); // Pasar las opciones aquí
    console.log('Connected to MongoDB successfully');
    return client.db(dbName);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = connectToDatabase;
