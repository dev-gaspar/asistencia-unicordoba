const express = require('express');
const router = express.Router();
const Evento = require('../models/Evento');
const Dispositivo = require('../models/Dispositivo');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Crear evento
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, fecha, hora_inicio, hora_fin, lugar, imagen_url, dispositivo } = req.body;

    if (!nombre || !fecha || !hora_inicio || !hora_fin || !lugar || !dispositivo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos obligatorios son requeridos' 
      });
    }

    // Verificar que el dispositivo existe
    const dispositivoExiste = await Dispositivo.findById(dispositivo);
    if (!dispositivoExiste) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dispositivo no encontrado' 
      });
    }

    const evento = new Evento({
      nombre,
      descripcion,
      fecha,
      hora_inicio,
      hora_fin,
      lugar,
      imagen_url,
      dispositivo
    });

    await evento.save();
    await evento.populate('dispositivo');

    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      evento
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear evento', 
      error: error.message 
    });
  }
});

// Listar eventos
router.get('/', async (req, res) => {
  try {
    const { activo, finalizado, dispositivo, fecha_desde, fecha_hasta } = req.query;
    
    let filtro = {};
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (finalizado !== undefined) filtro.finalizado = finalizado === 'true';
    if (dispositivo) filtro.dispositivo = dispositivo;
    
    if (fecha_desde || fecha_hasta) {
      filtro.fecha = {};
      if (fecha_desde) filtro.fecha.$gte = new Date(fecha_desde);
      if (fecha_hasta) filtro.fecha.$lte = new Date(fecha_hasta);
    }
    
    const eventos = await Evento.find(filtro)
      .populate('dispositivo')
      .sort({ fecha: -1 });
    
    res.json({
      success: true,
      count: eventos.length,
      eventos
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener eventos', 
      error: error.message 
    });
  }
});

// Obtener evento por ID
router.get('/:id', async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id).populate('dispositivo');
    
    if (!evento) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }

    res.json({
      success: true,
      evento
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener evento', 
      error: error.message 
    });
  }
});

// Obtener evento activo por dispositivo
router.get('/dispositivo/:codigo', async (req, res) => {
  try {
    const dispositivo = await Dispositivo.findOne({ codigo: req.params.codigo.toUpperCase() });
    
    if (!dispositivo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dispositivo no encontrado' 
      });
    }

    const evento = await Evento.findOne({ 
      dispositivo: dispositivo._id,
      activo: true,
      finalizado: false
    }).populate('dispositivo');
    
    if (!evento) {
      return res.status(404).json({ 
        success: false, 
        message: 'No hay evento activo para este dispositivo' 
      });
    }

    res.json({
      success: true,
      evento
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener evento', 
      error: error.message 
    });
  }
});

// Actualizar evento
router.put('/:id', async (req, res) => {
  try {
    const evento = await Evento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('dispositivo');

    if (!evento) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      evento
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar evento', 
      error: error.message 
    });
  }
});

// Eliminar evento
router.delete('/:id', async (req, res) => {
  try {
    const evento = await Evento.findByIdAndDelete(req.params.id);
    
    if (!evento) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar evento', 
      error: error.message 
    });
  }
});

module.exports = router;
