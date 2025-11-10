const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  fecha: {
    type: Date,
    required: true
  },
  hora_inicio: {
    type: String,
    required: true
  },
  hora_fin: {
    type: String,
    required: true
  },
  lugar: {
    type: String,
    required: true,
    trim: true
  },
  imagen_url: {
    type: String,
    trim: true
  },
  dispositivo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispositivo',
    required: true
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
  },
  finalizado: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índice para búsquedas por fecha y dispositivo
eventoSchema.index({ fecha: 1, dispositivo: 1 });

module.exports = mongoose.model('Evento', eventoSchema);
