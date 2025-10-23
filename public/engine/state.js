/**
 * DeckForge Engine - State Management
 * 
 * Core game state structure and initialization
 */

export function createInitialState(config = {}) {
  return {
    // Meta
    gameId: generateId(),
    version: '1.0.0',
    turn: 1,
    phase: 'start',  // 'start' | 'enemy' | 'player' | 'cleanup' | 'gameover'
    
    // Player
    player: {
      maxEnergy: config.startingEnergy || 3,
      currentEnergy: config.startingEnergy || 3,
      maxHealth: config.startingHealth || 50,
      currentHealth: config.startingHealth || 50,
      block: 0,
      powers: {},
      currency: initializeCurrencies(config.currencies || []),
    },
    
    // Deck system
    deck: [],
    drawPile: [],
    hand: [],
    discardPile: [],
    exhaustPile: [],
    removedPile: [],
    
    // Enemies
    enemies: [],
    
    // Game state
    currentAct: 1,
    gameOver: false,
    victory: false,
    defeatReason: null,
    
    // Config reference
    config: config
  }
}

function initializeCurrencies(currencies) {
  const result = {}
  currencies.forEach(currency => {
    result[currency.id] = currency.startingAmount || 0
  })
  return result
}

function generateId() {
  return 'game_' + Math.random().toString(36).substr(2, 9)
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state))
}



