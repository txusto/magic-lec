# 🎨 Magic LED Control - Sistema de Control de Tira LED WS2812B

Sistema completo de domótica para controlar una tira LED WS2812B mediante ESP32 y una interfaz web moderna.

## 📋 Características

- 🌈 Control de color RGB completo
- 💡 Control de brillo (0-100%)
- 🔌 Encendido/Apagado
- 🎨 10 colores predefinidos
- 📱 Interfaz web responsive para móvil
- 🔄 Actualización en tiempo real
- ✨ Diseño premium con glassmorphism

## 🛠️ Hardware Necesario

- **ESP32 DevKit V1**
- **Tira LED WS2812B** (60 LEDs configurados por defecto)
- **Fuente de alimentación 5V** (según cantidad de LEDs)
- **Cables de conexión**

### 📐 Diagrama de Conexión

```
ESP32 DevKit V1          WS2812B LED Strip
┌─────────────┐          ┌──────────────┐
│             │          │              │
│    GPIO 5   ├─────────►│ DIN (Data)   │
│             │          │              │
│     GND     ├─────────►│ GND          │
│             │          │              │
└─────────────┘          │ 5V           │◄─── Fuente 5V
                         └──────────────┘
```

> **⚠️ IMPORTANTE**: 
> - Conecta el GND de la fuente de alimentación al GND del ESP32
> - Para más de 10-15 LEDs, usa una fuente de alimentación externa
> - Calcula ~60mA por LED a máximo brillo blanco

## 🚀 Instalación

### 1️⃣ Configurar el Firmware del ESP32

#### Requisitos
- PlatformIO IDE (extensión de VS Code)
- Cable USB para ESP32

#### Pasos

1. Abre la carpeta `esp32-firmware` en VS Code con PlatformIO

2. Conecta tu ESP32 al ordenador vía USB

3. Compila y sube el firmware:
   ```bash
   cd esp32-firmware
   pio run --target upload
   ```

4. Abre el monitor serial para ver la información de conexión:
   ```bash
   pio device monitor
   ```

   Deberías ver algo como:
   ```
   AP IP address: 192.168.4.1
   SSID: LED-Control
   Password: 12345678
   ```

### 2️⃣ Configurar la Interfaz Web

#### Requisitos
- Node.js (v18 o superior)
- npm

#### Pasos

1. Navega a la carpeta del proyecto web:
   ```bash
   cd web-control
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

   El servidor estará disponible en `http://localhost:3000`

4. **Modo Simulación (Sin ESP32)**: Para probar la interfaz sin hardware:
   ```bash
   npm run dev:mock
   ```
   
   Esto iniciará la aplicación con datos simulados. Verás un indicador "🧪 Modo Simulación" en la interfaz.
   Todos los controles funcionarán normalmente, pero los cambios solo se reflejarán en el navegador.

## 📱 Uso desde el Móvil

### Opción 1: Conectarse al ESP32 directamente (Recomendado)

1. **Conecta tu móvil a la red WiFi del ESP32:**
   - SSID: `LED-Control`
   - Contraseña: `12345678`

2. **Abre el navegador en tu móvil y ve a:**
   ```
   http://192.168.4.1
   ```

> **Nota**: Para esta opción, necesitas compilar la aplicación web y subirla al ESP32 usando SPIFFS. Por ahora, usa la Opción 2.

### Opción 2: Usar el servidor de desarrollo

1. **Asegúrate de que tu ordenador y móvil están en la misma red WiFi**

2. **En tu ordenador, inicia el servidor de desarrollo:**
   ```bash
   cd web-control
   npm run dev
   ```

3. **Encuentra la IP de tu ordenador:**
   - Windows: `ipconfig` (busca IPv4)
   - Mac/Linux: `ifconfig` o `ip addr`

4. **En tu móvil, abre el navegador y ve a:**
   ```
   http://[IP-DE-TU-ORDENADOR]:3000
   ```

5. **Conecta tu ordenador a la red WiFi del ESP32** (`LED-Control`)

## 🎮 Controles de la Interfaz

### Selector de Color
- Usa el selector de color para elegir cualquier color RGB
- Los valores RGB se muestran en tiempo real

### Control de Brillo
- Desliza el control para ajustar el brillo (0-100%)
- El cambio se aplica inmediatamente

### Botón de Encendido/Apagado
- Verde: LEDs encendidos
- Rojo: LEDs apagados

### Colores Predefinidos
10 colores listos para usar con un solo toque:
- Blanco, Rojo, Verde, Azul
- Amarillo, Cyan, Magenta
- Naranja, Púrpura, Rosa

### Indicador de Conexión
- 🟢 Verde parpadeante: Conectado al ESP32
- 🔴 Rojo: Desconectado

## 🔧 Configuración Avanzada

### Cambiar el número de LEDs

Edita `esp32-firmware/src/main.cpp`:
```cpp
#define NUM_LEDS 60  // Cambia este valor
```

### Cambiar el pin GPIO

Edita `esp32-firmware/src/main.cpp`:
```cpp
#define LED_PIN 5  // Cambia este valor
```

### Cambiar credenciales WiFi del AP

Edita `esp32-firmware/src/main.cpp`:
```cpp
const char* ap_ssid = "LED-Control";      // Cambia el nombre
const char* ap_password = "12345678";     // Cambia la contraseña (mín. 8 caracteres)
```

### Cambiar la IP del ESP32 en la web

Edita `web-control/src/App.jsx`:
```javascript
const ESP32_IP = '192.168.4.1'  // Cambia si usas IP diferente
```

## 📡 API REST

El ESP32 expone los siguientes endpoints:

### `POST /api/color`
Establece el color RGB de los LEDs.

**Request:**
```json
{
  "r": 255,
  "g": 0,
  "b": 0
}
```

**Response:**
```json
{
  "status": "ok"
}
```

### `POST /api/brightness`
Establece el brillo de los LEDs.

**Request:**
```json
{
  "value": 128
}
```

**Response:**
```json
{
  "status": "ok"
}
```

### `POST /api/power`
Enciende o apaga los LEDs.

**Request:**
```json
{
  "state": true
}
```

**Response:**
```json
{
  "status": "ok"
}
```

### `GET /api/status`
Obtiene el estado actual de los LEDs.

**Response:**
```json
{
  "r": 255,
  "g": 255,
  "b": 255,
  "brightness": 128,
  "power": true
}
```

## 🐛 Solución de Problemas

### El ESP32 no se conecta
- Verifica que el cable USB esté bien conectado
- Asegúrate de seleccionar el puerto COM correcto en PlatformIO
- Presiona el botón BOOT en el ESP32 mientras subes el firmware

### Los LEDs no se encienden
- Verifica las conexiones (especialmente GND común)
- Asegúrate de que la fuente de alimentación sea suficiente
- Revisa que el pin GPIO sea el correcto (GPIO 5 por defecto)
- Comprueba que el tipo de LED sea WS2812B

### No puedo conectarme desde el móvil
- Verifica que estés conectado a la red WiFi "LED-Control"
- Asegúrate de usar la IP correcta: `192.168.4.1`
- Desactiva los datos móviles en tu teléfono
- Algunos móviles desconectan WiFi sin internet, desactiva esta opción

### La interfaz web no carga
- Verifica que Node.js esté instalado: `node --version`
- Asegúrate de haber ejecutado `npm install`
- Revisa que el puerto 3000 no esté en uso

## 📚 Tecnologías Utilizadas

### Frontend
- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos y diseño
- **Fetch API** - Comunicación con ESP32

### Backend (ESP32)
- **Arduino Framework** - Base del firmware
- **FastLED** - Control de LEDs WS2812B
- **ESPAsyncWebServer** - Servidor web asíncrono
- **ArduinoJson** - Parsing JSON
- **AsyncTCP** - Comunicación TCP asíncrona

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y educativo.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras algún bug o tienes ideas para mejorar el proyecto, no dudes en crear un issue o pull request.

## ✨ Características Futuras

- [ ] Efectos de animación (arcoíris, fade, etc.)
- [ ] Guardado de presets personalizados
- [ ] Control por voz
- [ ] Integración con Home Assistant
- [ ] Modo música (reacción al sonido)
- [ ] Programación de horarios

---

Hecho con ❤️ para control de LEDs inteligente
