const express = require('express');
const router = express.Router();
const Estudiante = require('../models/Estudiante');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Listar estudiantes
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    
    let filtro = {};
    if (search) {
      filtro = {
        $or: [
          { nombre: { $regex: search, $options: 'i' } },
          { codigo_carnet: { $regex: search, $options: 'i' } },
          { identificacion: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
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

// Obtener estudiante por código de carnet
router.get('/codigo/:codigo', async (req, res) => {
  try {
    const estudiante = await Estudiante.findOne({ 
      codigo_carnet: req.params.codigo.toUpperCase() 
    });
    
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
