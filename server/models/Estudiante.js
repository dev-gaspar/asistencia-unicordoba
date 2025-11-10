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
    trim: true
  },
  codigo_carnet: {
    type: String,
    required: true,
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
  periodo: {
    type: String,
    required: true,
    trim: true,
    // Formato: "2025-II", "2026-I"
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice compuesto único por código de carnet y periodo
estudianteSchema.index({ codigo_carnet: 1, periodo: 1 }, { unique: true });
// Índice compuesto único por identificación y periodo
estudianteSchema.index({ identificacion: 1, periodo: 1 }, { unique: true });

module.exports = mongoose.model('Estudiante', estudianteSchema);
