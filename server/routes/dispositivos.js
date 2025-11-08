const express = require('express');
const router = express.Router();
const Dispositivo = require('../models/Dispositivo');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Crear dispositivo
router.post('/', async (req, res) => {
  try {
    const { codigo, nombre, ubicacion, nota } = req.body;

    if (!codigo || !nombre) {
      return res.status(400).json({ 
        success: false, 
        message: 'Código y nombre son requeridos' 
      });
    }

    const existeDispositivo = await Dispositivo.findOne({ codigo });
    if (existeDispositivo) {
      return res.status(400).json({ 
        success: false, 
        message: 'El código del dispositivo ya existe' 
      });
    }

    const dispositivo = new Dispositivo({
      codigo,
      nombre,
      ubicacion,
      nota
    });

    await dispositivo.save();

    res.status(201).json({
      success: true,
      message: 'Dispositivo creado exitosamente',
      dispositivo
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear dispositivo', 
      error: error.message 
    });
  }
});

// Listar dispositivos
router.get('/', async (req, res) => {
  try {
    const { activo } = req.query;
    const filtro = activo !== undefined ? { activo: activo === 'true' } : {};
    
    const dispositivos = await Dispositivo.find(filtro).sort({ nombre: 1 });
    
    res.json({
      success: true,
      count: dispositivos.length,
      dispositivos
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener dispositivos', 
      error: error.message 
    });
  }
});

// Obtener dispositivo por ID
router.get('/:id', async (req, res) => {
  try {
    const dispositivo = await Dispositivo.findById(req.params.id);
    
    if (!dispositivo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dispositivo no encontrado' 
      });
    }

    res.json({
      success: true,
      dispositivo
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener dispositivo', 
      error: error.message 
    });
  }
});

// Actualizar dispositivo
router.put('/:id', async (req, res) => {
  try {
    const dispositivo = await Dispositivo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!dispositivo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dispositivo no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Dispositivo actualizado exitosamente',
      dispositivo
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar dispositivo', 
      error: error.message 
    });
  }
});

// Eliminar dispositivo
router.delete('/:id', async (req, res) => {
  try {
    const dispositivo = await Dispositivo.findByIdAndDelete(req.params.id);
    
    if (!dispositivo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dispositivo no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Dispositivo eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar dispositivo', 
      error: error.message 
    });
  }
});

module.exports = router;
