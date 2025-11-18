# Sistema de Asistencia - Frontend

Frontend desarrollado con React + Vite + Mantine para el Sistema de Asistencia a Eventos de la Unicordoba.

## 🚀 Tecnologías

- **React 18** - Librería de UI
- **Vite** - Build tool y dev server
- **Mantine 7** - Librería de componentes UI
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Tabler Icons** - Iconos
- **Day.js** - Manejo de fechas

## 📦 Instalación

```bash
npm install
```

## 🏃‍♂️ Desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🏗️ Build para Producción

```bash
npm run build
```

## 📱 Características

### Autenticación

- Login con JWT
- Protección de rutas
- Manejo automático de tokens

### Módulos

#### Dashboard

- Vista general del sistema
- Estadísticas de estudiantes, dispositivos y eventos
- Estado del sistema

#### Usuarios (Solo Admin)

- CRUD completo de usuarios
- Asignación de roles (admin/operador)
- Activación/desactivación de usuarios

#### Estudiantes

- Listado de 15,761 estudiantes sincronizados
- Búsqueda por nombre, código, identificación o email
- Paginación (50 por página)

#### Dispositivos ESP32

- CRUD completo de dispositivos
- Códigos únicos para cada dispositivo
- Gestión de ubicación y notas

#### Eventos

- CRUD completo de eventos
- Upload de imágenes
- Asignación a dispositivos
- Gestión de fecha, hora y lugar
- Estados: activo/inactivo, finalizado

#### Asistencias

- Consulta de asistencias por evento
- Listado detallado con información del estudiante
- Exportación de datos
- Detalle de evento con lista completa

## 🎨 Tema Institucional

El frontend utiliza una paleta de colores verde institucional para la Unicordoba:

- **Primary**: Verde (#43a047, #2e7d32)
- **Gradientes**: De verde claro a verde oscuro
- **Accent**: Colores complementarios para estados y badges

## 🔐 Autenticación

El sistema requiere autenticación para todas las rutas excepto `/login`.

**Credenciales por defecto:**

- Usuario: `admin`
- Contraseña: `admin123`

## 📡 API

El frontend se conecta al backend en `http://localhost:3000/api`

Para cambiar la URL de la API, crear un archivo `.env`:

```env
VITE_API_URL=http://tu-servidor:3000/api
```

## 🌐 Estructura de Archivos

```
client/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── context/         # Context API (Auth)
│   ├── layouts/         # Layouts (Dashboard)
│   ├── pages/           # Páginas principales
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Usuarios.jsx
│   │   ├── Estudiantes.jsx
│   │   ├── Dispositivos.jsx
│   │   ├── Eventos.jsx
│   │   ├── EventoDetalle.jsx
│   │   └── Asistencias.jsx
│   ├── routes/          # Configuración de rutas
│   ├── services/        # Servicios API
│   ├── theme.js         # Tema de Mantine
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## 🎯 Funcionalidades Clave

### Sidebar Institucional

- Logo de la Unicordoba
- Navegación por módulos
- Información del usuario logueado
- Menú de cierre de sesión

### Tablas Interactivas

- Ordenamiento
- Búsqueda
- Paginación
- Acciones rápidas (editar, eliminar, ver)

### Formularios Completos

- Validación en tiempo real
- Mensajes de error claros
- Upload de archivos (imágenes)
- Selectores de fecha y hora

### Notificaciones

- Confirmación de acciones
- Mensajes de éxito/error
- Toasts informativos

### Modales de Confirmación

- Para acciones destructivas
- Prevención de errores accidentales

## 🔧 Configuración del Proxy

Vite está configurado para hacer proxy de las peticiones `/api` al backend en desarrollo:

```js
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

## 📊 Consumo de Endpoints

El frontend consume todos los endpoints de la API:

- ✅ Auth: login, me
- ✅ Usuarios: CRUD completo
- ✅ Estudiantes: listado, búsqueda, paginación
- ✅ Dispositivos: CRUD completo
- ✅ Eventos: CRUD completo
- ✅ Asistencia: consultas por evento y estudiante
- ✅ Upload: subida de imágenes

## 👥 Roles y Permisos

- **Admin**: Acceso completo a todos los módulos
- **Operador**: Acceso a todos los módulos excepto Usuarios

## 🎓 Unicordoba

Sistema desarrollado para la gestión de asistencia a eventos institucionales.

---

**Nota**: Asegúrate de que el backend esté corriendo en `http://localhost:3000` antes de iniciar el frontend.
