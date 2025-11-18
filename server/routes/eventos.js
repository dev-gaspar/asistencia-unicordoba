const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const Evento = require('../models/Evento');
const Dispositivo = require('../models/Dispositivo');
const Usuario = require('../models/Usuario');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Crear evento
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, fecha, hora_inicio, hora_fin, fecha_hora_inicio, fecha_hora_fin, lugar, imagen_url, dispositivo, periodo, fotos_evidencia } = req.body;

    if (!nombre || !fecha || !hora_inicio || !hora_fin || !lugar || !periodo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos obligatorios son requeridos' 
      });
    }

    // Verificar que el dispositivo existe (si se proporciona)
    if (dispositivo) {
      const dispositivoExiste = await Dispositivo.findById(dispositivo);
      if (!dispositivoExiste) {
        return res.status(404).json({ 
          success: false, 
          message: 'Dispositivo no encontrado' 
        });
      }
    }

    // Construir fecha_hora_inicio y fecha_hora_fin si no se proporcionan
    let fechaHoraInicio, fechaHoraFin;
    
    if (fecha_hora_inicio) {
      fechaHoraInicio = dayjs(fecha_hora_inicio).toDate();
    } else if (hora_inicio) {
      const [horaI, minI] = hora_inicio.split(':');
      fechaHoraInicio = dayjs(fecha)
        .hour(parseInt(horaI))
        .minute(parseInt(minI))
        .second(0)
        .toDate();
    } else {
      fechaHoraInicio = dayjs(fecha).toDate();
    }

    if (fecha_hora_fin) {
      fechaHoraFin = dayjs(fecha_hora_fin).toDate();
    } else if (hora_fin) {
      const [horaF, minF] = hora_fin.split(':');
      fechaHoraFin = dayjs(fecha)
        .hour(parseInt(horaF))
        .minute(parseInt(minF))
        .second(0)
        .toDate();
    } else {
      fechaHoraFin = dayjs(fecha).toDate();
    }

    // Construir objeto del evento (solo incluir dispositivo si existe)
    const eventoData = {
      nombre,
      descripcion,
      fecha,
      hora_inicio,
      hora_fin,
      fecha_hora_inicio: fechaHoraInicio,
      fecha_hora_fin: fechaHoraFin,
      lugar,
      imagen_url,
      periodo,
      area: req.usuario.area,
      creado_por: req.usuario._id,
      fotos_evidencia: fotos_evidencia || [],
      activo: true,
      finalizado: false
    };

    // Solo agregar dispositivo si se proporcionó uno válido
    if (dispositivo && dispositivo.trim() !== '') {
      eventoData.dispositivo = dispositivo;
    }

    const evento = new Evento(eventoData);

    await evento.save();
    await evento.populate(['dispositivo', 'creado_por']);

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
    const { activo, finalizado, dispositivo, fecha_desde, fecha_hasta, area, periodo, profesional } = req.query;
    
    // Finalizar automáticamente eventos que ya pasaron (operación concurrente)
    const ahora = dayjs().toDate();
    await Evento.updateMany(
      {
        fecha_hora_fin: { $lt: ahora },
        finalizado: false
      },
      {
        $set: { finalizado: true }
      }
    ).exec().catch(err => console.error('Error al finalizar eventos:', err));
    
    let filtro = {};
    
    // Filtrar según rol del usuario
    if (req.usuario.rol === 'profesional') {
      // Profesional solo ve sus propios eventos
      filtro.creado_por = req.usuario._id;
    } else if (req.usuario.rol === 'coordinador') {
      // Coordinador ve todos los eventos de su área
      filtro.area = req.usuario.area;
    }
    // Administrador ve todos los eventos
    
    // Aplicar filtros adicionales
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (finalizado !== undefined) filtro.finalizado = finalizado === 'true';
    if (dispositivo) filtro.dispositivo = dispositivo;
    if (area && req.usuario.rol === 'administrador') filtro.area = area;
    if (periodo) filtro.periodo = periodo;
    if (profesional) filtro.creado_por = profesional;
    
    if (fecha_desde || fecha_hasta) {
      filtro.fecha = {};
      if (fecha_desde) filtro.fecha.$gte = dayjs(fecha_desde).toDate();
      if (fecha_hasta) filtro.fecha.$lte = dayjs(fecha_hasta).toDate();
    }
    
    const eventos = await Evento.find(filtro)
      .populate('dispositivo')
      .populate('creado_por', 'nombre apellidos usuario area')
      .populate('area', 'nombre codigo color')
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
    const evento = await Evento.findById(req.params.id)
      .populate('dispositivo')
      .populate('creado_por', 'nombre apellidos usuario area')
      .populate('area', 'nombre codigo color');
    
    if (!evento) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }

    // Verificar permisos
    if (req.usuario.rol === 'profesional' && evento.creado_por._id.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para ver este evento' 
      });
    }

    if (req.usuario.rol === 'coordinador') {
      // Obtener el ID del área (puede ser un objeto poblado o un ObjectId)
      const eventoAreaId = evento.area._id ? evento.area._id.toString() : evento.area.toString();
      if (eventoAreaId !== req.usuario.area.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'No tienes permisos para ver eventos de otra área' 
        });
      }
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
    const eventoExistente = await Evento.findById(req.params.id);
    
    if (!eventoExistente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }

    // Verificar permisos
    if (req.usuario.rol === 'profesional' && eventoExistente.creado_por.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para actualizar este evento' 
      });
    }

    if (req.usuario.rol === 'coordinador') {
      const eventoAreaId = eventoExistente.area._id ? eventoExistente.area._id.toString() : eventoExistente.area.toString();
      if (eventoAreaId !== req.usuario.area.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'No tienes permisos para actualizar eventos de otra área' 
        });
      }
    }

    // Solo el administrador puede cambiar el área del evento
    if (req.body.area && req.usuario.rol !== 'administrador') {
      return res.status(403).json({ 
        success: false, 
        message: 'Solo el administrador puede cambiar el área del evento' 
      });
    }

    // Limpiar dispositivo si viene vacío
    if (req.body.dispositivo !== undefined && (!req.body.dispositivo || req.body.dispositivo.trim() === '')) {
      req.body.dispositivo = null;
    }

    // Actualizar fecha_hora_inicio y fecha_hora_fin si se modifican fecha u horas
    if (req.body.fecha || req.body.hora_inicio || req.body.hora_fin) {
      const fechaEvento = req.body.fecha ? dayjs(req.body.fecha) : dayjs(eventoExistente.fecha);
      const horaInicio = req.body.hora_inicio || eventoExistente.hora_inicio;
      const horaFin = req.body.hora_fin || eventoExistente.hora_fin;

      const [horaI, minI] = horaInicio.split(':');
      const fechaHoraInicio = fechaEvento
        .hour(parseInt(horaI))
        .minute(parseInt(minI))
        .second(0)
        .toDate();
      req.body.fecha_hora_inicio = fechaHoraInicio;

      const [horaF, minF] = horaFin.split(':');
      const fechaHoraFin = fechaEvento
        .hour(parseInt(horaF))
        .minute(parseInt(minF))
        .second(0)
        .toDate();
      req.body.fecha_hora_fin = fechaHoraFin;
    }

    const evento = await Evento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['dispositivo', 'creado_por']);

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
    const eventoExistente = await Evento.findById(req.params.id);
    
    if (!eventoExistente) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }

    // Verificar permisos
    if (req.usuario.rol === 'profesional' && eventoExistente.creado_por.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para eliminar este evento' 
      });
    }

    if (req.usuario.rol === 'coordinador') {
      const eventoAreaId = eventoExistente.area._id ? eventoExistente.area._id.toString() : eventoExistente.area.toString();
      if (eventoAreaId !== req.usuario.area.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'No tienes permisos para eliminar eventos de otra área' 
        });
      }
    }

    await Evento.findByIdAndDelete(req.params.id);

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

// Añadir foto de evidencia a un evento
router.post('/:id/fotos', async (req, res) => {
  try {
    const { url, descripcion } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: 'La URL de la foto es requerida' 
      });
    }

    const evento = await Evento.findById(req.params.id);
    
    if (!evento) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }

    // Verificar permisos
    if (req.usuario.rol === 'profesional' && evento.creado_por.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para añadir fotos a este evento' 
      });
    }

    if (req.usuario.rol === 'coordinador') {
      const eventoAreaId = evento.area._id ? evento.area._id.toString() : evento.area.toString();
      if (eventoAreaId !== req.usuario.area.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'No tienes permisos para añadir fotos a eventos de otra área' 
        });
      }
    }

    evento.fotos_evidencia.push({
      url,
      descripcion: descripcion || '',
      fecha_subida: dayjs().toDate()
    });

    await evento.save();

    res.json({
      success: true,
      message: 'Foto añadida exitosamente',
      evento
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al añadir foto', 
      error: error.message 
    });
  }
});

// Eliminar foto de evidencia de un evento
router.delete('/:id/fotos/:fotoId', async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    
    if (!evento) {
      return res.status(404).json({ 
        success: false, 
        message: 'Evento no encontrado' 
      });
    }

    // Verificar permisos - Solo admin, coordinador del área o creador del evento
    if (req.usuario.rol === 'profesional' && evento.creado_por.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para eliminar fotos de este evento' 
      });
    }

    if (req.usuario.rol === 'coordinador') {
      const eventoAreaId = evento.area._id ? evento.area._id.toString() : evento.area.toString();
      if (eventoAreaId !== req.usuario.area.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'No tienes permisos para eliminar fotos de eventos de otra área' 
        });
      }
    }

    // Buscar y eliminar la foto
    const fotoIndex = evento.fotos_evidencia.findIndex(foto => foto._id.toString() === req.params.fotoId);
    
    if (fotoIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Foto no encontrada' 
      });
    }

    evento.fotos_evidencia.splice(fotoIndex, 1);
    await evento.save();

    res.json({
      success: true,
      message: 'Foto eliminada exitosamente',
      evento
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar foto', 
      error: error.message 
    });
  }
});

// Obtener lista de profesionales (para filtros)
router.get('/filtros/profesionales', async (req, res) => {
  try {
    let filtro = { rol: 'profesional' };
    
    // Coordinador solo ve profesionales de su área
    if (req.usuario.rol === 'coordinador') {
      filtro.area = req.usuario.area;
    }

    const profesionales = await Usuario.find(filtro)
      .select('nombre apellidos usuario area')
      .sort({ nombre: 1 });

    res.json({
      success: true,
      profesionales
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener profesionales', 
      error: error.message 
    });
  }
});

module.exports = router;
