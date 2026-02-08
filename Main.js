import LootLink, { matches } from './LootLink.js'

// Check if current domain matches
function shouldExecute() {
    const currentDomain = window.location.hostname
    return matches.some(domain => currentDomain.includes(domain))
}

// Wait for page to be ready
function init() {
    if (!shouldExecute()) {
        console.log('❌ Not a LootLink domain')
        return
    }

    console.log('✅ LootLink domain detected')
    
    // Create and execute bypass
    const bypass = new LootLink()
    bypass.execute()
}

// Execute when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
