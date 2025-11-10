const mongoose = require('mongoose');

const estudianteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  tipo_identificacion: {
    type: String,
    required: true,
    trim: true
  },
  identificacion: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  codigo_carnet: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  tipo_vinculacion: {
    type: String,
    trim: true,
    default: ''
  },
  facultad: {
    type: String,
    trim: true,
    default: ''
  },
  programa: {
    type: String,
    trim: true,
    default: ''
  },
  sem: {
    type: String,
    trim: true,
    default: ''
  },
  circunscripcion: {
    type: String,
    trim: true,
    default: ''
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice para búsqueda rápida por código de carnet
estudianteSchema.index({ codigo_carnet: 1 });

module.exports = mongoose.model('Estudiante', estudianteSchema);
