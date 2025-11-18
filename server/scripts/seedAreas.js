/**
 * Script para poblar las áreas de bienestar iniciales
 * Ejecutar: node server/scripts/seedAreas.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Area = require('../models/Area');

const areasIniciales = [
  {
    nombre: 'Deporte',
    codigo: 'DEP',
    descripcion: 'Área de Deportes y Actividad Física',
    color: '#FF5722'
  },
  {
    nombre: 'Cultura',
    codigo: 'CUL',
    descripcion: 'Área de Cultura y Expresiones Artísticas',
    color: '#9C27B0'
  },
  {
    nombre: 'Desarrollo Humano',
    codigo: 'DH',
    descripcion: 'Área de Desarrollo Humano y Formación Integral',
    color: '#2196F3'
  },
  {
    nombre: 'Promoción Social',
    codigo: 'PS',
    descripcion: 'Área de Promoción Social y Acompañamiento',
    color: '#FF9800'
  },
  {
    nombre: 'Salud',
    codigo: 'SAL',
    descripcion: 'Área de Salud y Bienestar',
    color: '#4CAF50'
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/asistencia-unicordoba', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

const seedAreas = async () => {
  try {
    console.log('\n🌱 Poblando áreas de bienestar...\n');
    console.log('='.repeat(60));

    // Verificar si ya existen áreas
    const areasExistentes = await Area.countDocuments();
    
    if (areasExistentes > 0) {
      console.log(`\n⚠️  Ya existen ${areasExistentes} área(s) en la base de datos.`);
      console.log('¿Deseas continuar de todas formas? (Se omitirán duplicados)\n');
    }

    let creadas = 0;
    let omitidas = 0;

    for (const areaData of areasIniciales) {
      try {
        // Verificar si el área ya existe
        const existe = await Area.findOne({ 
          $or: [
            { nombre: areaData.nombre },
            { codigo: areaData.codigo }
          ]
        });

        if (existe) {
          console.log(`⏭️  Omitiendo "${areaData.nombre}" (ya existe)`);
          omitidas++;
        } else {
          const area = new Area(areaData);
          await area.save();
          console.log(`✅ Creada: ${areaData.nombre} (${areaData.codigo})`);
          creadas++;
        }
      } catch (error) {
        console.error(`❌ Error al crear "${areaData.nombre}":`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Áreas creadas: ${creadas}`);
    console.log(`   ⏭️  Áreas omitidas: ${omitidas}`);
    console.log(`   📁 Total en BD: ${await Area.countDocuments()}\n`);

    if (creadas > 0) {
      console.log('✅ Áreas pobladas exitosamente\n');
    } else {
      console.log('ℹ️  No se crearon nuevas áreas\n');
    }

    // Mostrar todas las áreas
    const todasLasAreas = await Area.find().sort({ nombre: 1 });
    console.log('📋 Áreas en la base de datos:');
    console.log('='.repeat(60));
    todasLasAreas.forEach(area => {
      console.log(`   ${area.codigo.padEnd(5)} | ${area.nombre.padEnd(25)} | ${area.color}`);
    });
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error al poblar áreas:', error);
  }
};

const run = async () => {
  await connectDB();
  await seedAreas();
  await mongoose.connection.close();
  console.log('👋 Desconectado de MongoDB\n');
};

run().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

