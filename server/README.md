# Sistema de Asistencia a Eventos - Unicordoba

API REST completa para gestión de asistencia a eventos universitarios mediante dispositivos ESP32-CAM con lectores QR.

## 📋 Características

- ✅ Autenticación JWT
- ✅ Gestión de usuarios (CRUD)
- ✅ Gestión de estudiantes sincronizados desde CSV
- ✅ Gestión de dispositivos ESP32
- ✅ Gestión de eventos
- ✅ Registro de asistencia en tiempo real
- ✅ Upload de imágenes para eventos
- ✅ Base de datos MongoDB
- ✅ 15,761 estudiantes sincronizados

## 🚀 Instalación

### Requisitos previos

- Node.js 16+
- MongoDB 4.4+

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/asistencia_unicordoba
JWT_SECRET=tu_secreto_jwt_super_seguro
NODE_ENV=development
```

### 3. Iniciar MongoDB

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### 4. Crear usuario administrador

```bash
node scripts/createAdmin.js
```

**Credenciales por defecto:**

- Usuario: `admin`
- Contraseña: `admin123`

### 5. Sincronizar estudiantes desde CSV

```bash
npm run sync
```

### 6. Iniciar servidor

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Documentación de la API

### 🔐 Autenticación

Todas las rutas (excepto `/api/asistencia/registrar`) requieren autenticación mediante JWT.

**Header requerido:**

```
Authorization: Bearer <token>
```

#### POST /api/auth/login

Iniciar sesión y obtener token JWT.

**Request:**

```json
{
	"usuario": "admin",
	"contrasena": "admin123"
}
```

**Response:**

```json
{
	"success": true,
	"message": "Login exitoso",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"usuario": {
		"id": "507f1f77bcf86cd799439011",
		"usuario": "admin",
		"rol": "admin"
	}
}
```

#### GET /api/auth/me

Obtener información del usuario autenticado.

---

### 👥 Usuarios

#### POST /api/usuarios (Admin)

Crear nuevo usuario.

**Request:**

```json
{
	"usuario": "operador1",
	"contrasena": "password123",
	"rol": "operador"
}
```

#### GET /api/usuarios (Admin)

Listar todos los usuarios.

#### PUT /api/usuarios/:id (Admin)

Actualizar usuario.

#### DELETE /api/usuarios/:id (Admin)

Eliminar usuario.

---

### 🎓 Estudiantes

#### GET /api/estudiantes

Listar estudiantes con paginación y búsqueda.

**Query params:**

- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 50)
- `search`: Búsqueda por nombre, código, identificación o email

**Response:**

```json
{
  "success": true,
  "estudiantes": [...],
  "totalPages": 317,
  "currentPage": 1,
  "total": 15761
}
```

#### GET /api/estudiantes/codigo/:codigo

Buscar estudiante por código de carnet.

**Ejemplo:** `/api/estudiantes/codigo/D868FBE390D7A5B`

#### GET /api/estudiantes/:id

Obtener estudiante por ID.

#### PUT /api/estudiantes/:id

Actualizar estudiante.

---

### 📱 Dispositivos ESP32

#### POST /api/dispositivos

Crear nuevo dispositivo.

**Request:**

```json
{
	"codigo": "ESP001",
	"nombre": "Entrada Principal",
	"ubicacion": "Edificio A - Piso 1",
	"nota": "Dispositivo para eventos del auditorio"
}
```

#### GET /api/dispositivos

Listar dispositivos.

**Query params:**

- `activo`: Filtrar por activos (true/false)

#### GET /api/dispositivos/:id

Obtener dispositivo por ID.

#### PUT /api/dispositivos/:id

Actualizar dispositivo.

#### DELETE /api/dispositivos/:id

Eliminar dispositivo.

---

### 📅 Eventos

#### POST /api/eventos

Crear nuevo evento.

**Request:**

```json
{
	"nombre": "Conferencia de Tecnología 2025",
	"descripcion": "Charlas sobre innovación tecnológica",
	"fecha": "2025-11-15T00:00:00.000Z",
	"hora_inicio": "08:00",
	"hora_fin": "17:00",
	"lugar": "Auditorio Principal",
	"imagen_url": "http://localhost:3000/uploads/evento-1699999999999-123456789.jpg",
	"dispositivo": "507f1f77bcf86cd799439011"
}
```

#### GET /api/eventos

Listar eventos.

**Query params:**

- `activo`: Filtrar por activos (true/false)
- `finalizado`: Filtrar por finalizados (true/false)
- `dispositivo`: Filtrar por ID de dispositivo
- `fecha_desde`: Filtrar desde fecha
- `fecha_hasta`: Filtrar hasta fecha

#### GET /api/eventos/:id

Obtener evento por ID.

#### GET /api/eventos/dispositivo/:codigo

Obtener evento activo de un dispositivo específico.

**Ejemplo:** `/api/eventos/dispositivo/ESP001`

#### PUT /api/eventos/:id

Actualizar evento.

#### DELETE /api/eventos/:id

Eliminar evento.

---

### ✅ Asistencia

#### POST /api/asistencia/registrar (Público - ESP32)

**⚠️ Este endpoint NO requiere autenticación (usado por ESP32)**

Registrar asistencia de un estudiante desde ESP32.

**Request:**

```json
{
	"payload": "9267CED7E9D0AE7",
	"dispositivo_codigo": "ESP001"
}
```

**Response exitosa:**

```json
{
	"success": true,
	"message": "Asistencia registrada exitosamente",
	"asistencia": {
		"id": "507f1f77bcf86cd799439011",
		"estudiante": {
			"nombre": "Gustavo Carlos Martinez Gonzalez",
			"codigo_carnet": "9267CED7E9D0AE7",
			"email": "gmartinezgonzalez@correo.unicordoba.edu.co"
		},
		"evento": {
			"nombre": "Conferencia de Tecnología 2025",
			"fecha": "2025-11-15T00:00:00.000Z"
		},
		"fecha_registro": "2025-11-08T18:05:32.123Z"
	}
}
```

**Posibles errores:**

- Dispositivo no encontrado o inactivo
- No hay evento activo para el dispositivo
- Estudiante no encontrado
- Asistencia ya registrada (duplicada)

#### GET /api/asistencia/evento/:eventoId

Obtener todas las asistencias de un evento.

#### GET /api/asistencia/evento/:eventoId/estadisticas

Obtener estadísticas de asistencia de un evento.

#### GET /api/asistencia/estudiante/:estudianteId

Obtener historial de asistencias de un estudiante.

#### DELETE /api/asistencia/:id

Eliminar registro de asistencia.

---

### 📸 Upload de Imágenes

#### POST /api/upload

Subir imagen para evento.

**Request:**

- Content-Type: `multipart/form-data`
- Field name: `imagen`
- Formatos permitidos: jpg, jpeg, png, gif, webp
- Tamaño máximo: 5MB

**Response:**

```json
{
	"success": true,
	"message": "Imagen subida exitosamente",
	"url": "http://localhost:3000/uploads/evento-1699999999999-123456789.jpg",
	"filename": "evento-1699999999999-123456789.jpg"
}
```

#### DELETE /api/upload/:filename

Eliminar imagen.

---

## 🔧 Comandos Disponibles

```bash
# Iniciar servidor
npm start

# Modo desarrollo con auto-reload
npm run dev

# Sincronizar estudiantes desde CSV
npm run sync

# Crear usuario administrador
node scripts/createAdmin.js
```

---

## 📱 Configuración ESP32

En el código del ESP32-CAM, configura:

```cpp
const char* ssid = "TU_RED_WIFI";
const char* password = "TU_PASSWORD";
const char* serverUrl = "http://192.168.1.XXX:3000/api/asistencia/registrar";
const char* dispositivo_codigo = "ESP001"; // Código único del dispositivo
```

**Para encontrar tu IP local:**

- Windows: `ipconfig` → IPv4 Address
- Mac/Linux: `ifconfig` o `ip addr`

---

## 🗄️ Estructura de la Base de Datos

### Colecciones MongoDB

- **usuarios**: Usuarios del sistema con autenticación
- **estudiantes**: 15,761 estudiantes sincronizados desde CSV
- **dispositivos**: Dispositivos ESP32 registrados
- **eventos**: Eventos creados
- **asistencias**: Registros de asistencia a eventos

---

## 📊 Flujo de Trabajo Completo

### 1. Setup inicial

```bash
npm install
node scripts/createAdmin.js
npm run sync
npm start
```

### 2. Configurar dispositivo ESP32

- Login en la API → obtener token
- Crear dispositivo (POST /api/dispositivos)
- Configurar código en ESP32

### 3. Crear evento

- Login → token
- (Opcional) Subir imagen → obtener URL
- Crear evento vinculado al dispositivo

### 4. Registro de asistencia

- ESP32 escanea código QR del estudiante
- ESP32 envía POST a `/api/asistencia/registrar`
- Sistema valida y registra asistencia
- LED del ESP32 se enciende 2 segundos si fue exitoso

### 5. Consultar asistencias

- GET `/api/asistencia/evento/:eventoId`
- Ver estadísticas y listado completo

---

## 🛡️ Seguridad

- ✅ Contraseñas encriptadas con bcrypt
- ✅ JWT para autenticación
- ✅ CORS habilitado
- ✅ Validación de datos en todos los endpoints
- ✅ Límite de tamaño en uploads (5MB)
- ⚠️ **Cambiar credenciales por defecto en producción**

---

## 🐛 Troubleshooting

### MongoDB no conecta

```bash
# Verificar que MongoDB esté corriendo
mongosh

# Iniciar MongoDB
# Windows: net start MongoDB
# Linux: sudo systemctl start mongod
```

### Error al sincronizar CSV

- Verificar que `estudiantes.csv` esté en el directorio raíz
- Verificar encoding del archivo (debe ser UTF-8 o Latin-1)
- Verificar formato del CSV (separador: `;`)

### ESP32 no registra asistencia

- Verificar conexión WiFi del ESP32
- Verificar IP del servidor en código ESP32
- Verificar que exista un evento activo para el dispositivo
- Revisar logs del servidor

---

## 📝 Licencia

ISC

---

## 👨‍💻 Desarrollo

**Unicordoba - Sistema de Asistencia a Eventos**

Para más información o soporte técnico, contactar al administrador del sistema.
