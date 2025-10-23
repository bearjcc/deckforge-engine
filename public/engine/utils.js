/**
 * DeckForge Engine - Utilities
 * 
 * Helper functions for the game engine
 */

export function shuffle(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getTargets(state, targetString) {
  if (targetString === 'player' || targetString === 'self') {
    return [state.player]
  }
  
  if (targetString === 'all enemies') {
    return state.enemies.filter(e => e.currentHealth > 0)
  }
  
  if (targetString.startsWith('enemy')) {
    const index = parseInt(targetString.replace('enemy', ''))
    if (state.enemies[index]) {
      return [state.enemies[index]]
    }
  }
  
  if (targetString === 'random enemy') {
    const living = state.enemies.filter(e => e.currentHealth > 0)
    if (living.length > 0) {
      return [living[Math.floor(Math.random() * living.length)]]
    }
  }
  
  return []
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max))
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`
}

