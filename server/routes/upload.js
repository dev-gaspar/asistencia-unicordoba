const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verificarToken } = require("../middleware/auth");

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadsDir);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, "evento-" + uniqueSuffix + path.extname(file.originalname));
	},
});

// Filtrar solo imágenes
const fileFilter = (req, file, cb) => {
	const allowedTypes = /jpeg|jpg|png|gif|webp/;
	const extname = allowedTypes.test(
		path.extname(file.originalname).toLowerCase()
	);
	const mimetype = allowedTypes.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null, true);
	} else {
		cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif, webp)"));
	}
};

const upload = multer({
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
	fileFilter: fileFilter,
});

// Subir imagen
router.post("/", verificarToken, upload.single("imagen"), (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: "No se proporcionó ninguna imagen",
			});
		}

		const imageUrl = `${process.env.SERVER_URL}/uploads/${req.file.filename}`;

		res.json({
			success: true,
			message: "Imagen subida exitosamente",
			url: imageUrl,
			filename: req.file.filename,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error al subir imagen",
			error: error.message,
		});
	}
});

// Eliminar imagen
router.delete("/:filename", verificarToken, (req, res) => {
	try {
		const filepath = path.join(uploadsDir, req.params.filename);

		if (!fs.existsSync(filepath)) {
			return res.status(404).json({
				success: false,
				message: "Imagen no encontrada",
			});
		}

		fs.unlinkSync(filepath);

		res.json({
			success: true,
			message: "Imagen eliminada exitosamente",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error al eliminar imagen",
			error: error.message,
		});
	}
});

module.exports = router;
