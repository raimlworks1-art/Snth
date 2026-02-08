export default class LootLink {
    constructor() {
        this.config = {
            INCENTIVE_SYNCER_DOMAIN: 'gateway.playbite.com',
            INCENTIVE_SERVER_DOMAIN: 'api.lootlinks.com',
            TASK_ID: 54,
            TID: '',
            KEY: ''
        }
    }

    execute() {
        console.log('🔍 LootLink Bypass Starting...')
        
        // Check for direct bypass first (method 1)
        if (/[?&]r=/.test(window.location.href)) {
            this.directBypass()
        } else {
            // Use WebSocket method (method 2)
            this.setupFetchInterceptor()
        }
    }

    directBypass() {
        try {
            const urlParams = new URLSearchParams(window.location.search)
            const r = urlParams.get('r')
            const finalURL = decodeURIComponent(escape(atob(r)))
            console.log('🎯 Direct bypass URL:', finalURL)
            this.navigate(finalURL)
        } catch (error) {
            console.error('❌ Direct bypass failed:', error)
        }
    }

    setupFetchInterceptor() {
        const originalFetch = window.fetch
        
        window.fetch = async (url, config) => {
            if (url.includes(`${this.config.INCENTIVE_SYNCER_DOMAIN}/tc`)) {
                try {
                    const response = await originalFetch(url, config)
                    
                    if (response.ok) {
                        this.handleIncentiveResponse(response.clone())
                    }
                    
                    return response
                } catch (error) {
                    console.error('❌ Fetch error:', error)
                    return originalFetch(url, config)
                }
            }
            
            return originalFetch(url, config)
        }
        
        console.log('✅ Fetch interceptor active')
    }

    async handleIncentiveResponse(response) {
        try {
            const data = await response.json()
            console.log('📦 Data received')
            
            if (!data || data.length === 0) {
                console.error('❌ Empty response')
                return
            }

            const { urid, action_pixel_url } = data[0]
            
            if (!urid) {
                console.error('❌ Missing URID')
                return
            }

            console.log('🔑 URID:', urid)
            
            this.showMessage('⏳ Searching for destination link...')
            
            this.sendTrackingBeacons(urid, action_pixel_url)
            this.setupWebSocket(urid)
            
        } catch (error) {
            console.error('❌ Response handling error:', error)
        }
    }

    sendTrackingBeacons(urid, action_pixel_url) {
        try {
            const serverNum = urid.substr(-5) % 3
            
            navigator.sendBeacon(
                `https://${serverNum}.${this.config.INCENTIVE_SERVER_DOMAIN}/st?uid=${urid}&cat=${this.config.TASK_ID}`
            )
            
            fetch(
                `https://${this.config.INCENTIVE_SYNCER_DOMAIN}/td?ac=1&urid=${urid}&cat=${this.config.TASK_ID}&tid=${this.config.TID}`
            ).catch(() => {})
            
            if (action_pixel_url) {
                fetch(action_pixel_url).catch(() => {})
            }
            
            console.log('📡 Beacons sent')
        } catch (error) {
            console.error('❌ Beacon error:', error)
        }
    }

    setupWebSocket(urid) {
        try {
            const serverNum = urid.substr(-5) % 3
            const wsUrl = `wss://${serverNum}.${this.config.INCENTIVE_SERVER_DOMAIN}/c?uid=${urid}&cat=${this.config.TASK_ID}&key=${this.config.KEY}`
            
            console.log('🔌 Connecting WebSocket...')
            const ws = new WebSocket(wsUrl)
            
            let heartbeat
            
            ws.onopen = () => {
                console.log('✅ WebSocket connected')
                heartbeat = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send('0')
                    }
                }, 1000)
            }
            
            ws.onmessage = (event) => {
                console.log('📨 Message:', event.data)
                
                if (event.data.includes('r:')) {
                    clearInterval(heartbeat)
                    ws.close()
                    
                    const encryptedData = event.data.replace('r:', '')
                    const finalUrl = this.decryptLink(encryptedData)
                    
                    if (finalUrl) {
                        console.log('🎯 Final URL:', finalUrl)
                        this.navigate(finalUrl)
                    }
                }
            }
            
            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error)
                clearInterval(heartbeat)
            }
            
            ws.onclose = () => {
                console.log('🔌 WebSocket closed')
                clearInterval(heartbeat)
            }
            
            // Timeout after 30 seconds
            setTimeout(() => {
                if (ws.readyState !== WebSocket.CLOSED) {
                    clearInterval(heartbeat)
                    ws.close()
                    console.error('⏱️ WebSocket timeout')
                }
            }, 30000)
            
        } catch (error) {
            console.error('❌ WebSocket setup error:', error)
        }
    }

    decryptLink(encodedData) {
        try {
            const combinationLink = atob(encodedData)
            const key = combinationLink.substring(0, 5)
            const encryptedLink = combinationLink.substring(5)
            
            let decrypted = ''
            for (let i = 0; i < encryptedLink.length; i++) {
                const encChar = encryptedLink.charCodeAt(i)
                const keyChar = key.charCodeAt(i % key.length)
                decrypted += String.fromCharCode(encChar ^ keyChar)
            }
            
            console.log('🔓 Decrypted')
            return decrypted
            
        } catch (error) {
            console.error('❌ Decryption error:', error)
            return null
        }
    }

    // Helper: Navigate to URL
    navigate(url) {
        if (!url) return
        console.log('🚀 Navigating to:', url)
        window.location.href = url
    }

    // Helper: Show message on screen
    showMessage(text) {
        const existing = document.getElementById('lootlink-msg')
        if (existing) existing.remove()
        
        const div = document.createElement('div')
        div.id = 'lootlink-msg'
        div.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            z-index: 999999;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        `
        div.textContent = text
        document.body.appendChild(div)
    }
}

export const matches = [
    'lootlinks.co',
    'loot-links.com',
    'loot-link.com',
    'linksloot.net',
    'lootdest.com',
    'lootlink.org',
    'lootdest.info',
    'lootdest.org',
    'links-loot.com'
]
