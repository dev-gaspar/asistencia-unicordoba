# ESP32-CAM - Lector de Códigos QR
## Sistema de Asistencia UniCórdoba

Este código permite al ESP32-CAM escanear códigos QR y enviar la información al servidor de asistencias.

## 📋 Requisitos

### Hardware
- ESP32-CAM (AI-Thinker)
- Módulo programador FTDI o similar
- Cable micro USB

### Software
- Arduino IDE
- Librería ESP32 Boards
- Librería `quirc` (incluida en el proyecto)

## ⚙️ Configuración

### 1. Configurar WiFi

Edita las siguientes líneas en `esp.ino`:

```cpp
const char* ssid = "TU_RED_WIFI";           // Nombre de tu red WiFi
const char* password = "TU_CONTRASEÑA_WIFI"; // Contraseña de tu WiFi
```

### 2. Configurar Código del Dispositivo

Cada ESP32-CAM debe tener un código único:

```cpp
const char* dispositivo_codigo = "ESP001";  // Cambiar: ESP001, ESP002, ESP003, etc.
```

Este código debe estar registrado previamente en el sistema web en la sección de "Dispositivos".

### 3. URL del Servidor (Ya Configurada)

El código ya está configurado para producción:

```cpp
const char* serverUrl = "https://asistencia-unicor-api.bambai.tech/api/asistencia/registrar";
```

## 📥 Instalación en Arduino IDE

### 1. Instalar ESP32 Boards

1. Abrir Arduino IDE
2. Ir a `Archivo` → `Preferencias`
3. En "Gestor de URLs Adicionales de Tarjetas" añadir:
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
4. Ir a `Herramientas` → `Placa` → `Gestor de tarjetas`
5. Buscar "esp32" e instalar "ESP32 by Espressif Systems"

### 2. Configurar Placa

- **Placa**: `AI Thinker ESP32-CAM`
- **Flash Mode**: `QIO`
- **Flash Size**: `4MB (32Mb)`
- **Partition Scheme**: `Huge APP (3MB No OTA/1MB SPIFFS)`
- **Core Debug Level**: `None`
- **Erase All Flash Before Sketch Upload**: `Disabled`

### 3. Subir el Código

1. Conectar el ESP32-CAM al programador FTDI
2. Conectar GPIO 0 a GND (modo programación)
3. Conectar USB al ordenador
4. Seleccionar el puerto COM correcto
5. Abrir `esp.ino`
6. Configurar WiFi y código de dispositivo
7. Hacer clic en "Subir"
8. Desconectar GPIO 0 de GND
9. Presionar el botón RESET

## 🔌 Conexiones FTDI

| FTDI | ESP32-CAM |
|------|-----------|
| 5V   | 5V        |
| GND  | GND       |
| TX   | U0R       |
| RX   | U0T       |

**Para programar**: Conectar GPIO 0 a GND antes de conectar la alimentación.

## 💡 Funcionamiento del LED

El LED integrado (GPIO 4) indica el estado:

- **LED encendido 0.5s**: QR detectado y leyendo
- **LED apagado**: Enviando datos al servidor
- **LED parpadeando 2 veces**: Error (sin WiFi o error del servidor)
- **Sin parpadeo después de envío**: Registro exitoso

## 📝 Formato del Código QR

El código QR debe contener el **código del carnet del estudiante** (ejemplo: `1151977169`).

El sistema automáticamente:
1. Busca el estudiante por el código
2. Verifica que haya un evento activo para este dispositivo
3. Registra la asistencia con fecha y hora
4. Evita duplicados en el mismo evento

## 🔍 Monitoreo Serial

Conectar a 115200 baudios para ver logs:

```
Connecting to WiFi...
WiFi connected successfully!
IP Address: 192.168.1.100

QRCodeReader is ready.
QRCodeReader running on core 0

Decoding successful:
Version: 2
ECC level: M
Mask: 3
Length: 10
Payload: 1151977169

LED encendido - QR detectado
LED apagado - Enviando datos...
Sending POST request to server...
JSON: {"payload":"1151977169","dispositivo_codigo":"ESP001"}
HTTP Response code: 200
Response: {"success":true,"message":"Asistencia registrada"}
Asistencia registrada exitosamente - OK
```

## 🐛 Solución de Problemas

### No detecta códigos QR
- Verificar iluminación (agregar luz externa si es necesario)
- Acercar o alejar el código QR (distancia óptima: 10-20 cm)
- Asegurar que el código QR sea claro y de buen tamaño

### WiFi no conecta
- Verificar SSID y contraseña
- Asegurar que el router esté en rango
- Verificar que la red sea de 2.4GHz (el ESP32 no soporta 5GHz)

### Error al enviar datos
- Verificar que el servidor esté funcionando
- Verificar que el dispositivo esté registrado en el sistema
- Verificar que haya un evento activo para este dispositivo
- Revisar logs del servidor con `docker-compose logs -f backend`

### Error al subir código
- Verificar que GPIO 0 esté conectado a GND durante la programación
- Presionar botón RESET mientras está conectado
- Verificar la configuración de la placa en Arduino IDE
- Probar con velocidad de subida más lenta (115200)

## 🔄 Actualización de Firmware

Para actualizar el código en un ESP32-CAM ya instalado:

1. Abrir el monitor serial (115200 baudios)
2. Anotar la IP asignada
3. Desconectar alimentación
4. Conectar FTDI y GPIO 0 a GND
5. Subir nuevo código
6. Desconectar GPIO 0 de GND
7. Presionar RESET
8. Verificar en el monitor serial que funcione

## 📚 Referencias

- ESP32-CAM QR Code Reader: https://www.youtube.com/watch?v=ULZL37YqJc8
- Librería quirc: https://github.com/dlbeer/quirc
- Documentación ESP32: https://docs.espressif.com/

## 🔐 Seguridad

- El código usa HTTPS para comunicarse con el servidor
- Cada dispositivo tiene un código único
- El servidor valida que el dispositivo esté registrado
- No se almacenan contraseñas WiFi en el servidor

## 🆘 Soporte

Para problemas con el código del ESP32:
1. Revisar el monitor serial
2. Verificar logs del servidor
3. Asegurar que el dispositivo esté registrado en el sistema web
