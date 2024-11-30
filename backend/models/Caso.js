const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema({
  texto: String,
  autor: String,
  fecha: {
    type: Date,
    default: Date.now
  }
});

const casoSchema = new mongoose.Schema({
  audioUrl: String,
  transcripcion: String,
  sintomas: String,
  nivelUrgencia: {
    type: String,
    enum: ['bajo', 'medio', 'alto'],
    required: true
  },
  analisis: String,
  recomendaciones: [String],
  estado: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'completado'],
    default: 'pendiente'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  actualizaciones: [{
    fecha: Date,
    descripcion: String,
    nuevoEstado: String
  }],
  comentarios: [comentarioSchema],
  // Campos para estadísticas
  tiempoResolucion: Number,
  derivadoA: String,
  seguimientoRequerido: Boolean
});

// Índices para búsqueda
casoSchema.index({ transcripcion: 'text', sintomas: 'text' });

module.exports = mongoose.model('Caso', casoSchema); 