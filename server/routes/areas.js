const express = require('express');
const router = express.Router();
const Area = require('../models/Area');
const { verificarToken, esAdmin } = require('../middleware/auth');

// Obtener todas las áreas (requiere autenticación)
router.get('/', verificarToken, async (req, res) => {
  try {
    const { activo } = req.query;
    
    let filtro = {};
    if (activo !== undefined) filtro.activo = activo === 'true';
    
    const areas = await Area.find(filtro).sort({ nombre: 1 });
    
    res.json({
      success: true,
      count: areas.length,
      areas
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener áreas', 
      error: error.message 
    });
  }
});

// Obtener área por ID (requiere autenticación)
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    
    if (!area) {
      return res.status(404).json({ 
        success: false, 
        message: 'Área no encontrada' 
      });
    }

    res.json({
      success: true,
      area
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener área', 
      error: error.message 
    });
  }
});

// Crear área (solo admin)
router.post('/', verificarToken, esAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, codigo, color } = req.body;

    if (!nombre || !codigo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre y código son requeridos' 
      });
    }

    // Verificar que el nombre no exista
    const existeNombre = await Area.findOne({ nombre });
    if (existeNombre) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un área con ese nombre' 
      });
    }

    // Verificar que el código no exista
    const existeCodigo = await Area.findOne({ codigo: codigo.toUpperCase() });
    if (existeCodigo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un área con ese código' 
      });
    }

    const area = new Area({
      nombre,
      descripcion,
      codigo: codigo.toUpperCase(),
      color: color || '#4CAF50'
    });

    await area.save();

    res.status(201).json({
      success: true,
      message: 'Área creada exitosamente',
      area
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear área', 
      error: error.message 
    });
  }
});

// Actualizar área (solo admin)
router.put('/:id', verificarToken, esAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, codigo, color, activo } = req.body;
    
    const area = await Area.findById(req.params.id);
    
    if (!area) {
      return res.status(404).json({ 
        success: false, 
        message: 'Área no encontrada' 
      });
    }

    // Verificar que el nuevo nombre no exista en otra área
    if (nombre && nombre !== area.nombre) {
      const existeNombre = await Area.findOne({ nombre, _id: { $ne: req.params.id } });
      if (existeNombre) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ya existe un área con ese nombre' 
        });
      }
    }

    // Verificar que el nuevo código no exista en otra área
    if (codigo && codigo.toUpperCase() !== area.codigo) {
      const existeCodigo = await Area.findOne({ 
        codigo: codigo.toUpperCase(), 
        _id: { $ne: req.params.id } 
      });
      if (existeCodigo) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ya existe un área con ese código' 
        });
      }
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (codigo) updateData.codigo = codigo.toUpperCase();
    if (color) updateData.color = color;
    if (typeof activo !== 'undefined') updateData.activo = activo;

    const areaActualizada = await Area.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Área actualizada exitosamente',
      area: areaActualizada
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar área', 
      error: error.message 
    });
  }
});

// Eliminar área (solo admin)
router.delete('/:id', verificarToken, esAdmin, async (req, res) => {
  try {
    // Verificar que no haya usuarios o eventos asociados
    const Usuario = require('../models/Usuario');
    const Evento = require('../models/Evento');
    
    const usuariosConArea = await Usuario.countDocuments({ area: req.params.id });
    if (usuariosConArea > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `No se puede eliminar el área porque tiene ${usuariosConArea} usuario(s) asociado(s)` 
      });
    }

    const eventosConArea = await Evento.countDocuments({ area: req.params.id });
    if (eventosConArea > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `No se puede eliminar el área porque tiene ${eventosConArea} evento(s) asociado(s)` 
      });
    }

    const area = await Area.findByIdAndDelete(req.params.id);
    
    if (!area) {
      return res.status(404).json({ 
        success: false, 
        message: 'Área no encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Área eliminada exitosamente'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar área', 
      error: error.message 
    });
  }
});

module.exports = router;

