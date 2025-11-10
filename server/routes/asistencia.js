const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Asistencia = require('../models/Asistencia');
const Estudiante = require('../models/Estudiante');
const Evento = require('../models/Evento');
const Dispositivo = require('../models/Dispositivo');
const { verificarToken } = require('../middleware/auth');

// Endpoint para recibir asistencias desde el ESP32 (sin autenticación)
router.post('/registrar', async (req, res) => {
  try {
    const { payload, dispositivo_codigo } = req.body;

    if (!payload || !dispositivo_codigo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payload y codigo de dispositivo son requeridos' 
      });
    }

    // Buscar dispositivo
    const dispositivo = await Dispositivo.findOne({ 
      codigo: dispositivo_codigo.toUpperCase(),
      activo: true 
    });
    
    if (!dispositivo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dispositivo no encontrado o inactivo' 
      });
    }

    // Buscar evento activo para este dispositivo
    const evento = await Evento.findOne({ 
      dispositivo: dispositivo._id,
      activo: true,
      finalizado: false
    });
    
    if (!evento) {
      return res.status(404).json({ 
        success: false, 
        message: 'No hay evento activo para este dispositivo' 
      });
    }

    // Buscar estudiante por código de carnet
    const estudiante = await Estudiante.findOne({ 
      codigo_carnet: payload.toUpperCase(),
      activo: true
    });
    
    if (!estudiante) {
      return res.status(404).json({ 
        success: false, 
        message: 'Estudiante no encontrado',
        codigo_carnet: payload
      });
    }

    // Verificar si ya registró asistencia
    const asistenciaExistente = await Asistencia.findOne({
      evento: evento._id,
      estudiante: estudiante._id
    });

    if (asistenciaExistente) {
      return res.status(400).json({ 
        success: false, 
        message: 'Asistencia ya registrada para este estudiante en este evento',
        estudiante: {
          nombre: estudiante.nombre,
          codigo_carnet: estudiante.codigo_carnet
        },
        fecha_registro_anterior: asistenciaExistente.fecha_registro
      });
    }

    // Registrar asistencia
    const asistencia = new Asistencia({
      evento: evento._id,
      estudiante: estudiante._id,
      dispositivo: dispositivo._id,
      codigo_carnet_escaneado: payload.toUpperCase()
    });

    await asistencia.save();
    await asistencia.populate(['evento', 'estudiante', 'dispositivo']);

    console.log('✅ Asistencia registrada:');
    console.log(`   Estudiante: ${estudiante.nombre}`);
    console.log(`   Evento: ${evento.nombre}`);
    console.log(`   Dispositivo: ${dispositivo.codigo}`);

    res.json({
      success: true,
      message: 'Asistencia registrada exitosamente',
      asistencia: {
        id: asistencia._id,
        estudiante: {
          nombre: estudiante.nombre,
          codigo_carnet: estudiante.codigo_carnet,
          email: estudiante.email
        },
        evento: {
          nombre: evento.nombre,
          fecha: evento.fecha
        },
        fecha_registro: asistencia.fecha_registro
      }
    });

  } catch (error) {
    console.error('❌ Error al registrar asistencia:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar asistencia', 
      error: error.message 
    });
  }
});

// Las siguientes rutas requieren autenticación
router.use(verificarToken);

// Obtener asistencias de un evento
router.get('/evento/:eventoId', async (req, res) => {
  try {
    const asistencias = await Asistencia.find({ evento: req.params.eventoId })
      .populate('estudiante')
      .populate('dispositivo')
      .sort({ fecha_registro: -1 });

    res.json({
      success: true,
      count: asistencias.length,
      asistencias
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener asistencias', 
      error: error.message 
    });
  }
});

// Obtener estadísticas de un evento
router.get('/evento/:eventoId/estadisticas', async (req, res) => {
  try {
    const totalAsistencias = await Asistencia.countDocuments({ 
      evento: req.params.eventoId 
    });

    const asistenciasPorHora = await Asistencia.aggregate([
      { $match: { evento: mongoose.Types.ObjectId(req.params.eventoId) } },
      {
        $group: {
          _id: { $hour: '$fecha_registro' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      estadisticas: {
        total: totalAsistencias,
        por_hora: asistenciasPorHora
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas', 
      error: error.message 
    });
  }
});

// Obtener historial de asistencias de un estudiante
router.get('/estudiante/:estudianteId', async (req, res) => {
  try {
    const asistencias = await Asistencia.find({ estudiante: req.params.estudianteId })
      .populate('evento')
      .populate('dispositivo')
      .sort({ fecha_registro: -1 });

    res.json({
      success: true,
      count: asistencias.length,
      asistencias
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener historial', 
      error: error.message 
    });
  }
});

// Eliminar asistencia (solo admin)
router.delete('/:id', async (req, res) => {
  try {
    const asistencia = await Asistencia.findByIdAndDelete(req.params.id);
    
    if (!asistencia) {
      return res.status(404).json({ 
        success: false, 
        message: 'Asistencia no encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Asistencia eliminada exitosamente'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar asistencia', 
      error: error.message 
    });
  }
});

// Exportar asistencias a Excel
router.get('/evento/:eventoId/exportar', async (req, res) => {
  try {
    // Obtener evento
    const evento = await Evento.findById(req.params.eventoId);
    if (!evento) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }

    // Obtener asistencias con datos de estudiantes
    const asistencias = await Asistencia.find({ evento: req.params.eventoId })
      .populate('estudiante')
      .sort({ fecha_registro: 1 });

    // Crear workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Asistencias');

    // Configurar columnas
    worksheet.columns = [
      { header: 'NOMBRES Y APELLIDOS', key: 'nombre', width: 40 },
      { header: 'DOCUMENTO DE IDENTIDAD', key: 'identificacion', width: 20 },
      { header: 'TIPO DE VINCULACION', key: 'tipo_vinculacion', width: 25 },
      { header: 'FACULTAD', key: 'facultad', width: 30 },
      { header: 'NOMBRE_PROGRAMA', key: 'programa', width: 40 },
      { header: 'SEM', key: 'sem', width: 10 },
      { header: 'CIRCUNSCRIPCION', key: 'circunscripcion', width: 25 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    asistencias.forEach((asistencia) => {
      if (asistencia.estudiante) {
        worksheet.addRow({
          nombre: asistencia.estudiante.nombre || '',
          identificacion: asistencia.estudiante.identificacion || '',
          tipo_vinculacion: asistencia.estudiante.tipo_vinculacion || '',
          facultad: asistencia.estudiante.facultad || '',
          programa: asistencia.estudiante.programa || '',
          sem: asistencia.estudiante.sem || '',
          circunscripcion: asistencia.estudiante.circunscripcion || ''
        });
      }
    });

    // Aplicar bordes a todas las celdas con datos
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Configurar respuesta
    const filename = `asistencias_${evento.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Enviar archivo
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error al exportar asistencias:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al exportar asistencias', 
      error: error.message 
    });
  }
});

module.exports = router;
