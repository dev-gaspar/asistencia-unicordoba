/**
 * Script para inicializar el sistema desde cero
 * Ejecutar: node server/scripts/initSystem.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");
const Area = require("../models/Area");

const areasIniciales = [
	{
		nombre: "Deporte",
		codigo: "DEP",
		descripcion: "Área de Deportes y Actividad Física",
		color: "#FF5722",
	},
	{
		nombre: "Cultura",
		codigo: "CUL",
		descripcion: "Área de Cultura y Expresiones Artísticas",
		color: "#9C27B0",
	},
	{
		nombre: "Desarrollo Humano",
		codigo: "DH",
		descripcion: "Área de Desarrollo Humano y Formación Integral",
		color: "#2196F3",
	},
	{
		nombre: "Promoción Social",
		codigo: "PS",
		descripcion: "Área de Promoción Social y Acompañamiento",
		color: "#FF9800",
	},
	{
		nombre: "Salud",
		codigo: "SAL",
		descripcion: "Área de Salud y Bienestar",
		color: "#4CAF50",
	},
	{
		nombre: "Bienestar",
		codigo: "BIEN",
		descripcion: "Área general de Bienestar",
		color: "#4CAF50",
	},
];

const connectDB = async () => {
	try {
		await mongoose.connect(
			process.env.MONGODB_URI ||
				"mongodb://localhost:27017/asistencia-unicordoba"
		);
		console.log("✅ Conectado a MongoDB");
	} catch (error) {
		console.error("❌ Error al conectar a MongoDB:", error.message);
		process.exit(1);
	}
};

const initSystem = async () => {
	try {
		console.log("\n🚀 Inicializando sistema...\n");
		console.log("=".repeat(60));

		// 1. Crear áreas
		console.log("\n1️⃣  Creando áreas...");
		const areasCreadas = [];
		for (const areaData of areasIniciales) {
			const area = await Area.create(areaData);
			areasCreadas.push(area);
			console.log(`   ✅ ${area.nombre} (${area.codigo})`);
		}

		// 2. Crear usuario administrador con área de Deporte
		console.log("\n2️⃣  Creando usuario administrador...");
		const areaBienestar = areasCreadas[areasCreadas.length - 1]; // Bienestar

		const admin = await Usuario.create({
			nombre: "Admin",
			apellidos: "Admin",
			cedula: "1000000000",
			cargo: "Administrador",
			area: areaBienestar._id,
			usuario: "admin",
			contrasena: "Admin123!",
			rol: "administrador",
			activo: true,
		});

		console.log(`   ✅ Usuario: ${admin.usuario}`);
		console.log(`   ✅ Contraseña: Admin123!`);
		console.log(`   ✅ Rol: ${admin.rol}`);
		console.log(`   ✅ Área: ${areaBienestar.nombre}`);

		console.log("\n" + "=".repeat(60));
		console.log("\n✨ Sistema inicializado correctamente\n");
		console.log("📝 Credenciales de acceso:");
		console.log("   Usuario: admin");
		console.log("   Contraseña: Admin123!\n");
	} catch (error) {
		console.error("\n❌ Error al inicializar sistema:", error.message);
		throw error;
	}
};

const run = async () => {
	await connectDB();
	await initSystem();
	await mongoose.connection.close();
	console.log("👋 Desconectado de MongoDB\n");
};

run().catch((error) => {
	console.error("❌ Error fatal:", error);
	process.exit(1);
});
