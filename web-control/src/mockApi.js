// Mock API service to simulate ESP32 responses for local development

// Simulated ESP32 state
let mockState = {
    r: 255,
    g: 255,
    b: 255,
    brightness: 128,
    power: true
}

// Simulate network delay
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API endpoints
export const mockApi = {
    // GET /api/status
    getStatus: async () => {
        await delay(50)
        console.log('[MOCK API] GET /api/status', mockState)
        return {
            ok: true,
            json: async () => ({ ...mockState })
        }
    },

    // POST /api/color
    setColor: async (data) => {
        await delay(100)
        mockState.r = data.r
        mockState.g = data.g
        mockState.b = data.b
        console.log('[MOCK API] POST /api/color', data)
        return {
            ok: true,
            json: async () => ({ status: 'ok' })
        }
    },

    // POST /api/brightness
    setBrightness: async (data) => {
        await delay(100)
        mockState.brightness = data.value
        console.log('[MOCK API] POST /api/brightness', data)
        return {
            ok: true,
            json: async () => ({ status: 'ok' })
        }
    },

    // POST /api/power
    setPower: async (data) => {
        await delay(100)
        mockState.power = data.state
        console.log('[MOCK API] POST /api/power', data)
        return {
            ok: true,
            json: async () => ({ status: 'ok' })
        }
    }
}

// Helper to determine which endpoint to call
export const mockFetch = async (url, options = {}) => {
    const endpoint = url.split('/api/')[1]
    
    if (options.method === 'GET' || !options.method) {
        if (endpoint === 'status') {
            return mockApi.getStatus()
        }
    }
    
    if (options.method === 'POST') {
        const data = JSON.parse(options.body)
        
        switch (endpoint) {
            case 'color':
                return mockApi.setColor(data)
            case 'brightness':
                return mockApi.setBrightness(data)
            case 'power':
                return mockApi.setPower(data)
            default:
                return { ok: false }
        }
    }
    
    return { ok: false }
}
