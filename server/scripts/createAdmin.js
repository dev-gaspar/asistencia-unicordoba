require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un admin
    const adminExistente = await Usuario.findOne({ usuario: 'admin' });
    
    if (adminExistente) {
      console.log('⚠️  El usuario admin ya existe');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Crear usuario admin
    const admin = new Usuario({
      usuario: 'admin',
      contrasena: 'admin123', // CAMBIAR ESTA CONTRASEÑA EN PRODUCCIÓN
      rol: 'admin'
    });

    await admin.save();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Usuario administrador creado exitosamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('   Rol: admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANTE: Cambia esta contraseña en producción\n');

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Error al crear admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdmin();
