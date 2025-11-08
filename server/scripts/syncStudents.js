require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Estudiante = require('../models/Estudiante');

const CSV_PATH = path.join(__dirname, '../../estudiantes.csv');

async function syncStudents() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');

    if (!fs.existsSync(CSV_PATH)) {
      console.error('❌ Archivo estudiantes.csv no encontrado en:', CSV_PATH);
      process.exit(1);
    }

    const estudiantes = [];
    let lineCount = 0;
    let errorCount = 0;

    // Leer el CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_PATH, { encoding: 'latin1' })
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          lineCount++;
          try {
            // Validar que tiene los campos requeridos
            if (row.nombre && row.tipo_identificacion && row.identificacion && 
                row.codigo_carnet && row.email) {
              
              estudiantes.push({
                nombre: row.nombre.trim(),
                tipo_identificacion: row.tipo_identificacion.trim(),
                identificacion: row.identificacion.trim(),
                codigo_carnet: row.codigo_carnet.trim().toUpperCase(),
                email: row.email.trim().toLowerCase(),
                activo: true
              });
            } else {
              console.warn(`⚠️  Línea ${lineCount}: Datos incompletos, ignorando...`);
              errorCount++;
            }
          } catch (error) {
            console.error(`❌ Error en línea ${lineCount}:`, error.message);
            errorCount++;
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`\n📊 Resumen de lectura del CSV:`);
    console.log(`   Total líneas leídas: ${lineCount}`);
    console.log(`   Estudiantes válidos: ${estudiantes.length}`);
    console.log(`   Errores/Omitidos: ${errorCount}\n`);

    if (estudiantes.length === 0) {
      console.log('⚠️  No hay estudiantes para sincronizar');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Sincronizar con MongoDB usando bulkWrite para mejor rendimiento
    console.log('🔄 Sincronizando estudiantes con MongoDB...\n');

    const bulkOps = estudiantes.map(estudiante => ({
      updateOne: {
        filter: { codigo_carnet: estudiante.codigo_carnet },
        update: { $set: estudiante },
        upsert: true
      }
    }));

    const result = await Estudiante.bulkWrite(bulkOps);

    console.log('✅ Sincronización completada:');
    console.log(`   Insertados: ${result.upsertedCount}`);
    console.log(`   Actualizados: ${result.modifiedCount}`);
    console.log(`   Total procesados: ${estudiantes.length}`);

    // Estadísticas adicionales
    const totalEnDB = await Estudiante.countDocuments();
    console.log(`\n📈 Total de estudiantes en la base de datos: ${totalEnDB}`);

    await mongoose.connection.close();
    console.log('\n✅ Proceso finalizado. Conexión cerrada.');

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Ejecutar sincronización
syncStudents();
