const mongoose = require('mongoose');

const asistenciaSchema = new mongoose.Schema({
  evento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evento',
    required: true
  },
  estudiante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estudiante',
    required: true
  },
  dispositivo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispositivo',
    required: true
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  },
  codigo_carnet_escaneado: {
    type: String,
    required: true,
    uppercase: true
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar registros duplicados
asistenciaSchema.index({ evento: 1, estudiante: 1 }, { unique: true });

// Índice para búsquedas por evento
asistenciaSchema.index({ evento: 1, fecha_registro: -1 });

module.exports = mongoose.model('Asistencia', asistenciaSchema);
