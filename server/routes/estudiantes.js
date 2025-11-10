const express = require('express');
const router = express.Router();
const Estudiante = require('../models/Estudiante');
const { verificarToken } = require('../middleware/auth');
const multer = require('multer');
const ExcelJS = require('exceljs');
const upload = multer({ storage: multer.memoryStorage() });

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener periodos disponibles
router.get('/periodos', async (req, res) => {
  try {
    const periodos = await Estudiante.distinct('periodo');
    res.json({
      success: true,
      periodos: periodos.sort().reverse() // Más recientes primero
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener periodos', 
      error: error.message 
    });
  }
});

// Descargar plantilla de Excel
router.get('/plantilla/descargar', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estudiantes');

    // Definir columnas
    worksheet.columns = [
      { header: 'nombre', key: 'nombre', width: 40 },
      { header: 'tipo_identificacion', key: 'tipo_identificacion', width: 20 },
      { header: 'identificacion', key: 'identificacion', width: 15 },
      { header: 'codigo_carnet', key: 'codigo_carnet', width: 15 },
      { header: 'email', key: 'email', width: 35 },
      { header: 'tipo_vinculacion', key: 'tipo_vinculacion', width: 20 },
      { header: 'facultad', key: 'facultad', width: 35 },
      { header: 'programa', key: 'programa', width: 50 },
      { header: 'sem', key: 'sem', width: 10 },
      { header: 'circunscripcion', key: 'circunscripcion', width: 25 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF43a047' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar fila de ejemplo
    worksheet.addRow({
      nombre: 'JUAN PEREZ GOMEZ',
      tipo_identificacion: 'CC',
      identificacion: '1234567890',
      codigo_carnet: '1234567890',
      email: 'juan.perez@example.com',
      tipo_vinculacion: 'Estudiante',
      facultad: 'Ingeniería',
      programa: 'Ingeniería de Sistemas',
      sem: '5',
      circunscripcion: 'Montería'
    });

    // Configurar respuesta
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=plantilla_estudiantes.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al generar plantilla', 
      error: error.message 
    });
  }
});

// Sincronizar estudiantes desde Excel
router.post('/sincronizar', upload.single('archivo'), async (req, res) => {
  try {
    const { periodo } = req.body;

    if (!periodo) {
      return res.status(400).json({ 
        success: false, 
        message: 'El periodo es requerido' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se ha subido ningún archivo' 
      });
    }

    // Leer archivo Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1);

    const estudiantes = [];
    let errores = [];
    let lineaActual = 1;

    worksheet.eachRow((row, rowNumber) => {
      lineaActual = rowNumber;
      // Saltar el encabezado
      if (rowNumber === 1) return;

      const rowData = {
        nombre: row.getCell(1).value?.toString().trim() || '',
        tipo_identificacion: row.getCell(2).value?.toString().trim() || '',
        identificacion: row.getCell(3).value?.toString().trim() || '',
        codigo_carnet: row.getCell(4).value?.toString().trim().toUpperCase() || '',
        email: row.getCell(5).value?.toString().trim().toLowerCase() || '',
        tipo_vinculacion: row.getCell(6).value?.toString().trim() || '',
        facultad: row.getCell(7).value?.toString().trim() || '',
        programa: row.getCell(8).value?.toString().trim() || '',
        sem: row.getCell(9).value?.toString().trim() || '',
        circunscripcion: row.getCell(10).value?.toString().trim() || '',
        periodo
      };

      // Validar campos requeridos
      if (!rowData.nombre || !rowData.tipo_identificacion || !rowData.identificacion || 
          !rowData.codigo_carnet || !rowData.email) {
        errores.push(`Línea ${rowNumber}: Faltan campos obligatorios`);
        return;
      }

      estudiantes.push(rowData);
    });

    if (errores.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Errores en el archivo', 
        errores 
      });
    }

    // Realizar la sincronización
    let insertados = 0;
    let actualizados = 0;
    let errorSync = [];

    for (const estudiante of estudiantes) {
      try {
        const existente = await Estudiante.findOne({
          codigo_carnet: estudiante.codigo_carnet,
          periodo: estudiante.periodo
        });

        if (existente) {
          await Estudiante.findByIdAndUpdate(existente._id, estudiante);
          actualizados++;
        } else {
          await Estudiante.create(estudiante);
          insertados++;
        }
      } catch (error) {
        errorSync.push(`Error con estudiante ${estudiante.codigo_carnet}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: 'Sincronización completada',
      resultado: {
        insertados,
        actualizados,
        total: insertados + actualizados,
        errores: errorSync
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al sincronizar estudiantes', 
      error: error.message 
    });
  }
});

// Listar estudiantes
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, periodo } = req.query;
    
    let filtro = {};
    
    // Filtrar por periodo si se proporciona
    if (periodo) {
      filtro.periodo = periodo;
    }
    
    if (search) {
      filtro.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { codigo_carnet: { $regex: search, $options: 'i' } },
        { identificacion: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const estudiantes = await Estudiante.find(filtro)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ nombre: 1 });
    
    const count = await Estudiante.countDocuments(filtro);
    
    res.json({
      success: true,
      estudiantes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estudiantes', 
      error: error.message 
    });
  }
});

// Obtener estudiante por código de carnet (periodo más reciente)
router.get('/codigo/:codigo', async (req, res) => {
  try {
    const estudiante = await Estudiante.findOne({ 
      codigo_carnet: req.params.codigo.toUpperCase() 
    }).sort({ periodo: -1 });
    
    if (!estudiante) {
      return res.status(404).json({ 
        success: false, 
        message: 'Estudiante no encontrado' 
      });
    }

    res.json({
      success: true,
      estudiante
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estudiante', 
      error: error.message 
    });
  }
});

// Obtener estudiante por ID
router.get('/:id', async (req, res) => {
  try {
    const estudiante = await Estudiante.findById(req.params.id);
    
    if (!estudiante) {
      return res.status(404).json({ 
        success: false, 
        message: 'Estudiante no encontrado' 
      });
    }

    res.json({
      success: true,
      estudiante
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estudiante', 
      error: error.message 
    });
  }
});

// Actualizar estudiante
router.put('/:id', async (req, res) => {
  try {
    const estudiante = await Estudiante.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!estudiante) {
      return res.status(404).json({ 
        success: false, 
        message: 'Estudiante no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Estudiante actualizado exitosamente',
      estudiante
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar estudiante', 
      error: error.message 
    });
  }
});

module.exports = router;
