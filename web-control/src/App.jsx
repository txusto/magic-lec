import { useState, useEffect } from 'react'
import { mockFetch } from './mockApi'

// Default ESP32 IP when in AP mode
const ESP32_IP = '192.168.4.1'

// Check if mock mode is enabled
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true'

function App() {
    const [color, setColor] = useState({ r: 255, g: 255, b: 255 })
    const [brightness, setBrightness] = useState(128)
    const [power, setPower] = useState(true)
    const [connected, setConnected] = useState(false)

    // Color presets
    const presets = [
        { name: 'Blanco', r: 255, g: 255, b: 255 },
        { name: 'Rojo', r: 255, g: 0, b: 0 },
        { name: 'Verde', r: 0, g: 255, b: 0 },
        { name: 'Azul', r: 0, g: 0, b: 255 },
        { name: 'Amarillo', r: 255, g: 255, b: 0 },
        { name: 'Cyan', r: 0, g: 255, b: 255 },
        { name: 'Magenta', r: 255, g: 0, b: 255 },
        { name: 'Naranja', r: 255, g: 165, b: 0 },
        { name: 'Púrpura', r: 128, g: 0, b: 128 },
        { name: 'Rosa', r: 255, g: 192, b: 203 },
    ]

    // Check connection status
    useEffect(() => {
        checkConnection()
        const interval = setInterval(checkConnection, 5000)
        return () => clearInterval(interval)
    }, [])

    const checkConnection = async () => {
        try {
            let response
            if (MOCK_MODE) {
                response = await mockFetch(`http://${ESP32_IP}/api/status`, { method: 'GET' })
            } else {
                response = await fetch(`http://${ESP32_IP}/api/status`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(2000)
                })
            }
            setConnected(response.ok)
        } catch (error) {
            setConnected(false)
        }
    }

    const sendCommand = async (endpoint, data) => {
        try {
            let response
            if (MOCK_MODE) {
                response = await mockFetch(`http://${ESP32_IP}/api/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                })
            } else {
                response = await fetch(`http://${ESP32_IP}/api/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                })
            }
            if (response.ok) {
                checkConnection()
            }
            return response.ok
        } catch (error) {
            console.error('Error sending command:', error)
            setConnected(false)
            return false
        }
    }

    const handleColorChange = (newColor) => {
        setColor(newColor)
        if (power) {
            sendCommand('color', newColor)
        }
    }

    const handleBrightnessChange = (value) => {
        setBrightness(value)
        sendCommand('brightness', { value: parseInt(value) })
    }

    const handlePowerToggle = () => {
        const newPower = !power
        setPower(newPower)
        sendCommand('power', { state: newPower })
    }

    const rgbToHex = (r, g, b) => {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16)
            return hex.length === 1 ? '0' + hex : hex
        }).join('')
    }

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Control LED
                    </h1>
                    {MOCK_MODE && (
                        <div className="mb-2 inline-block px-3 py-1 bg-blue-500/30 border border-blue-400/50 rounded-full">
                            <p className="text-xs text-blue-200">🧪 Modo Simulación</p>
                        </div>
                    )}
                    <div className="flex items-center justify-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                        <p className="text-sm text-white/70">
                            {connected ? 'Conectado' : 'Desconectado'}
                        </p>
                    </div>
                </div>

                {/* Main Control Card */}
                <div className="glass-card p-6 space-y-6">
                    {/* Power Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handlePowerToggle}
                            className={`glass-button px-8 py-4 text-lg font-semibold ${power ? 'bg-green-500/30 border-green-400' : 'bg-red-500/30 border-red-400'
                                }`}
                        >
                            {power ? '🔆 Encendido' : '🌙 Apagado'}
                        </button>
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-white/90">
                            Selector de Color
                        </label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="color"
                                value={rgbToHex(color.r, color.g, color.b)}
                                onChange={(e) => {
                                    const rgb = hexToRgb(e.target.value)
                                    if (rgb) handleColorChange(rgb)
                                }}
                                className="w-20 h-20 rounded-xl cursor-pointer border-2 border-white/30 bg-transparent"
                                disabled={!power}
                            />
                            <div className="flex-1 glass-card p-4">
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-red-400">R:</span>
                                        <span className="font-mono">{color.r}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-green-400">G:</span>
                                        <span className="font-mono">{color.g}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-400">B:</span>
                                        <span className="font-mono">{color.b}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Brightness Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-white/90">
                                Brillo
                            </label>
                            <span className="text-sm font-mono text-white/70">
                                {Math.round((brightness / 255) * 100)}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="255"
                            value={brightness}
                            onChange={(e) => handleBrightnessChange(e.target.value)}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                            disabled={!power}
                        />
                    </div>

                    {/* Color Presets */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-white/90">
                            Colores Predefinidos
                        </label>
                        <div className="grid grid-cols-5 gap-3">
                            {presets.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => handleColorChange({ r: preset.r, g: preset.g, b: preset.b })}
                                    className="color-preset"
                                    style={{ backgroundColor: rgbToHex(preset.r, preset.g, preset.b) }}
                                    title={preset.name}
                                    disabled={!power}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Connection Info */}
                {!connected && (
                    <div className="mt-4 glass-card p-4 border-yellow-400/50">
                        <p className="text-sm text-yellow-200 text-center">
                            ⚠️ Asegúrate de estar conectado a la red WiFi del ESP32
                            <br />
                            <span className="text-xs text-white/50">Red: LED-Control | IP: {ESP32_IP}</span>
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
        }
      `}</style>
        </div>
    )
}

export default App
