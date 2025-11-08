const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const { verificarToken, esAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación y rol de admin
router.use(verificarToken, esAdmin);

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const { usuario, contrasena, rol } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuario y contraseña son requeridos' 
      });
    }

    const existeUsuario = await Usuario.findOne({ usuario });
    if (existeUsuario) {
      return res.status(400).json({ 
        success: false, 
        message: 'El usuario ya existe' 
      });
    }

    const nuevoUsuario = new Usuario({
      usuario,
      contrasena,
      rol: rol || 'operador'
    });

    await nuevoUsuario.save();

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      usuario: {
        id: nuevoUsuario._id,
        usuario: nuevoUsuario.usuario,
        rol: nuevoUsuario.rol
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear usuario', 
      error: error.message 
    });
  }
});

// Listar usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-contrasena');
    res.json({
      success: true,
      usuarios
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener usuarios', 
      error: error.message 
    });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { usuario, contrasena, rol, activo } = req.body;
    const updateData = {};

    if (usuario) updateData.usuario = usuario;
    if (contrasena) updateData.contrasena = contrasena;
    if (rol) updateData.rol = rol;
    if (typeof activo !== 'undefined') updateData.activo = activo;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-contrasena');

    if (!usuarioActualizado) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar usuario', 
      error: error.message 
    });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar usuario', 
      error: error.message 
    });
  }
});

module.exports = router;
