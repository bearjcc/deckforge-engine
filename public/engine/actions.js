/**
 * DeckForge Engine - Actions
 * 
 * All state modifications happen through actions.
 * Each action takes current state and returns new state.
 */

import {cloneState} from './state.js'
import {shuffle, getTargets} from './utils.js'

// ===== CARD ACTIONS =====

export function drawCards(state, amount = 5) {
  state = cloneState(state)
  
  for (let i = 0; i < amount; i++) {
    // If draw pile empty, shuffle discard into draw pile
    if (state.drawPile.length === 0) {
      if (state.discardPile.length === 0) break
      state.drawPile = shuffle(state.discardPile)
      state.discardPile = []
    }
    
    const card = state.drawPile.shift()
    if (card) {
      state.hand.push(card)
    }
  }
  
  return state
}

export function playCard(state, cardId, target = 'enemy0') {
  state = cloneState(state)
  
  const cardIndex = state.hand.findIndex(c => c.id === cardId)
  if (cardIndex === -1) {
    throw new Error('Card not in hand')
  }
  
  const card = state.hand[cardIndex]
  
  // Check energy cost
  if (state.player.currentEnergy < (card.energyCost || 0)) {
    throw new Error('Not enough energy')
  }
  
  // Pay energy cost
  state.player.currentEnergy -= (card.energyCost || 0)
  
  // Remove from hand
  state.hand.splice(cardIndex, 1)
  
  // Apply effects
  const targets = getTargets(state, target)
  
  // Block
  if (card.block) {
    state.player.block += card.block
  }
  
  // Damage
  if (card.damage && targets.length > 0) {
    targets.forEach(t => {
      state = dealDamage(state, t, card.damage)
    })
  }
  
  // Heal
  if (card.heal) {
    state.player.currentHealth = Math.min(
      state.player.currentHealth + card.heal,
      state.player.maxHealth
    )
  }
  
  // Draw
  if (card.draw) {
    state = drawCards(state, card.draw)
  }
  
  // Currency gain
  if (card.currencyGain) {
    Object.entries(card.currencyGain).forEach(([currency, amount]) => {
      state.player.currency[currency] = (state.player.currency[currency] || 0) + amount
    })
  }
  
  // Powers
  if (card.powers && targets.length > 0) {
    targets.forEach(t => {
      Object.entries(card.powers).forEach(([power, stacks]) => {
        if (t === state.player || t.type) {  // Is it player or enemy
          t.powers = t.powers || {}
          t.powers[power] = (t.powers[power] || 0) + stacks
        }
      })
    })
  }
  
  // Move to discard (or exhaust)
  if (card.exhausts) {
    state.exhaustPile.push(card)
  } else {
    state.discardPile.push(card)
  }
  
  return state
}

export function discardHand(state) {
  state = cloneState(state)
  
  state.hand.forEach(card => {
    state.discardPile.push(card)
  })
  state.hand = []
  
  return state
}

export function acquireCard(state, cardTemplate) {
  state = cloneState(state)
  
  // Create card instance
  const newCard = {
    ...cardTemplate,
    id: generateCardId()
  }
  
  // Pay cost
  if (cardTemplate.currencyCost) {
    Object.entries(cardTemplate.currencyCost).forEach(([currency, amount]) => {
      state.player.currency[currency] -= amount
    })
  }
  
  // Add to deck and discard pile
  state.deck.push(newCard)
  state.discardPile.push(newCard)
  
  return state
}

// ===== COMBAT ACTIONS =====

export function dealDamage(state, target, baseDamage) {
  let damage = baseDamage
  
  // Apply vulnerable (50% more damage)
  if (target.powers && target.powers.vulnerable) {
    damage = Math.floor(damage * 1.5)
  }
  
  // Apply weak (25% less damage) if attacker has it
  if (state.player.powers.weak) {
    damage = Math.floor(damage * 0.75)
  }
  
  // Apply block first
  if (target.block && target.block > 0) {
    if (damage <= target.block) {
      target.block -= damage
      damage = 0
    } else {
      damage -= target.block
      target.block = 0
    }
  }
  
  // Apply health damage
  if (damage > 0) {
    target.currentHealth -= damage
    if (target.currentHealth < 0) target.currentHealth = 0
  }
  
  return state
}

// ===== TURN ACTIONS =====

export function startPlayerTurn(state) {
  state = cloneState(state)
  
  state.phase = 'player'
  
  // Reset energy
  state.player.currentEnergy = state.player.maxEnergy
  
  // Reset block
  state.player.block = 0
  
  // Draw cards
  state = drawCards(state, 5)
  
  return state
}

export function endPlayerTurn(state) {
  state = cloneState(state)
  
  // Discard hand
  state = discardHand(state)
  
  // Update power durations
  state = updatePowers(state)
  
  return state
}

export function executeEnemyTurn(state) {
  state = cloneState(state)
  
  state.phase = 'enemy'
  
  // Each enemy executes their intent
  state.enemies.forEach(enemy => {
    if (enemy.currentHealth <= 0) return
    
    const intent = enemy.intents[enemy.currentIntentIndex || 0]
    if (!intent) return
    
    // Execute intent
    if (intent.damage) {
      state = dealDamage(state, state.player, intent.damage)
    }
    
    if (intent.block) {
      enemy.block = (enemy.block || 0) + intent.block
    }
    
    if (intent.powers) {
      Object.entries(intent.powers).forEach(([power, stacks]) => {
        enemy.powers = enemy.powers || {}
        enemy.powers[power] = (enemy.powers[power] || 0) + stacks
      })
    }
    
    // Advance intent
    enemy.currentIntentIndex = ((enemy.currentIntentIndex || 0) + 1) % enemy.intents.length
  })
  
  return state
}

function updatePowers(state) {
  // Decrease player power durations
  Object.keys(state.player.powers).forEach(power => {
    state.player.powers[power] -= 1
    if (state.player.powers[power] <= 0) {
      delete state.player.powers[power]
    }
  })
  
  // Decrease enemy power durations
  state.enemies.forEach(enemy => {
    if (!enemy.powers) return
    Object.keys(enemy.powers).forEach(power => {
      enemy.powers[power] -= 1
      if (enemy.powers[power] <= 0) {
        delete enemy.powers[power]
      }
    })
  })
  
  return state
}

// ===== GAME FLOW =====

export function checkWinCondition(state) {
  // All enemies defeated
  const livingEnemies = state.enemies.filter(e => e.currentHealth > 0)
  return livingEnemies.length === 0
}

export function checkLossCondition(state) {
  // Player dead
  return state.player.currentHealth <= 0
}

export function endGame(state, victory, reason = null) {
  state = cloneState(state)
  state.gameOver = true
  state.victory = victory
  state.defeatReason = reason
  return state
}

// Helper
function generateCardId() {
  return 'card_' + Math.random().toString(36).substr(2, 9)
}

