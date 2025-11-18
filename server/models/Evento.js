const mongoose = require("mongoose");

const eventoSchema = new mongoose.Schema(
	{
		nombre: {
			type: String,
			required: true,
			trim: true,
		},
		descripcion: {
			type: String,
			trim: true,
		},
		fecha_hora_inicio: {
			type: Date,
			required: true,
		},
		fecha_hora_fin: {
			type: Date,
			required: true,
		},
		// Mantener compatibilidad con versión anterior
		fecha: {
			type: Date,
			required: true,
		},
		hora_inicio: {
			type: String,
			required: true,
		},
		hora_fin: {
			type: String,
			required: true,
		},
		lugar: {
			type: String,
			required: true,
			trim: true,
		},
		imagen_url: {
			type: String,
			trim: true,
		},
		fotos_evidencia: [
			{
				url: String,
				descripcion: String,
				fecha_subida: {
					type: Date,
					default: Date.now,
				},
			},
		],
		dispositivo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Dispositivo",
			required: false,
		},
		periodo: {
			type: String,
			required: true,
			trim: true,
			// Formato: "2025-II", "2026-I"
		},
		area: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Area",
			required: true,
		},
		creado_por: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Usuario",
			required: true,
		},
		activo: {
			type: Boolean,
			default: true,
		},
		finalizado: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

// Índice para búsquedas por fecha y dispositivo
eventoSchema.index({ fecha: 1, dispositivo: 1 });
eventoSchema.index({ area: 1, periodo: 1 });
eventoSchema.index({ creado_por: 1 });
eventoSchema.index({ fecha_hora_fin: 1, finalizado: 1 });

module.exports = mongoose.model("Evento", eventoSchema);
