const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  codigo: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  color: {
    type: String,
    default: '#4CAF50',
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índice para búsquedas
areaSchema.index({ nombre: 1 });
areaSchema.index({ codigo: 1 });

module.exports = mongoose.model('Area', areaSchema);

