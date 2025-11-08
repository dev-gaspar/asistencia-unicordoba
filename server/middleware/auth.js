const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acceso denegado. No se proporcionó token.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select('-contrasena');
    
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido o usuario inactivo.' 
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido.' 
    });
  }
};

// Verificar rol de administrador
const esAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }
  next();
};

module.exports = { verificarToken, esAdmin };
