const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const COLOMBIA_TZ = "America/Bogota";

const Evento = require("../models/Evento");

/**
 * Worker para finalizar eventos automáticamente
 * Se ejecuta cada 5 segundos y marca como finalizados los eventos cuya fecha_hora_fin ya pasó
 */
const finalizarEventosWorker = async () => {
	try {
		// Obtener la hora actual en UTC (así se compara con la BD)
		const ahoraUTC = dayjs.utc().toDate();

		// Buscar eventos que ya terminaron pero no están finalizados
		const resultado = await Evento.updateMany(
			{
				fecha_hora_fin: { $lt: ahoraUTC },
				finalizado: false,
			},
			{
				$set: { finalizado: true },
			}
		);

		if (resultado.modifiedCount > 0) {
			const horaColombiaStr = dayjs()
				.tz(COLOMBIA_TZ)
				.format("DD/MM/YYYY HH:mm:ss");
			console.log(
				`✅ [${horaColombiaStr}] Finalizados ${resultado.modifiedCount} evento(s) automáticamente`
			);
		}
	} catch (error) {
		console.error("❌ Error en worker de finalización de eventos:", error);
	}
};

/**
 * Iniciar el worker
 */
const iniciarWorker = () => {
	console.log(
		"🤖 Worker de finalización de eventos iniciado (cada 5 segundos)"
	);

	// Ejecutar inmediatamente
	finalizarEventosWorker();

	// Luego ejecutar cada 5 segundos
	setInterval(finalizarEventosWorker, 5000);
};

module.exports = { iniciarWorker, finalizarEventosWorker };
