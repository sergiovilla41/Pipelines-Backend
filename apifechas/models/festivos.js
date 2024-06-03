// Importar Mongoose
const mongoose = require('mongoose');

// Definir el esquema del modelo
const festivoSchema = new mongoose.Schema({
    id: Number,
    tipo: String,
    modoCalculo: String,
    festivos: [{
        dia: Number,
        mes: Number,
        nombre: String,
        diasPascua: Number
    }]
});

// Crear el modelo a partir del esquema
const Festivo = mongoose.model('Festivo', festivoSchema);

// Exportar el modelo
module.exports = Festivo;
