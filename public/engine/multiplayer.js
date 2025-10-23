/**
 * DeckForge Engine - Multiplayer Support
 * 
 * Handles multiple players (co-op or competitive)
 * Like Hogwarts Battle (1-4 players cooperative)
 */

import {cloneState} from './state.js'
import {generateId} from './utils.js'

// ===== PLAYER MANAGEMENT =====

export function createPlayer(playerConfig = {}, gameConfig = {}) {
  return {
    id: playerConfig.id || generateId('player'),
    name: playerConfig.name || 'Player',
    character: playerConfig.character || null,
    
    // Resources
    maxEnergy: gameConfig.startingEnergy || 3,
    currentEnergy: gameConfig.startingEnergy || 3,
    maxHealth: playerConfig.maxHealth || gameConfig.startingHealth || 50,
    currentHealth: playerConfig.currentHealth || playerConfig.maxHealth || gameConfig.startingHealth || 50,
    block: 0,
    
    // Status
    powers: {},
    currency: initializeCurrencies(gameConfig.currencies || []),
    persistentCurrency: {},
    
    // Deck system
    deck: [],
    drawPile: [],
    hand: [],
    discardPile: [],
    exhaustPile: [],
    
    // Player-specific abilities
    abilities: playerConfig.abilities || [],
    
    // Turn state
    isActive: false,
    hasEndedTurn: false
  }
}

function initializeCurrencies(currencies) {
  const result = {}
  currencies.forEach(currency => {
    result[currency.id] = currency.startingAmount || 0
  })
  return result
}

export function initializePlayers(state, playerConfigs) {
  state = cloneState(state)
  
  state.players = playerConfigs.map(config => 
    createPlayer(config, state.config)
  )
  
  state.currentPlayerIndex = 0
  state.players[0].isActive = true
  
  return state
}

// ===== TURN MANAGEMENT (Multiplayer) =====

export function startCurrentPlayerTurn(state) {
  state = cloneState(state)
  
  const player = state.players[state.currentPlayerIndex]
  player.isActive = true
  player.hasEndedTurn = false
  
  // Reset energy
  player.currentEnergy = player.maxEnergy
  
  // Reset block
  player.block = 0
  
  // Draw cards from this player's deck
  state = drawCardsForPlayer(state, state.currentPlayerIndex, 5)
  
  state.phase = 'player'
  
  return state
}

export function endCurrentPlayerTurn(state) {
  state = cloneState(state)
  
  const player = state.players[state.currentPlayerIndex]
  
  // Discard this player's hand
  player.hand.forEach(card => {
    player.discardPile.push(card)
  })
  player.hand = []
  
  // Reset turn-based currency
  if (state.config.marketSystem?.resetCurrency !== false) {
    Object.keys(player.currency).forEach(currency => {
      player.currency[currency] = 0
    })
  }
  
  // Update powers
  if (player.powers) {
    Object.keys(player.powers).forEach(power => {
      player.powers[power] -= 1
      if (player.powers[power] <= 0) {
        delete player.powers[power]
      }
    })
  }
  
  player.isActive = false
  player.hasEndedTurn = true
  
  return state
}

export function advanceToNextPlayer(state) {
  state = cloneState(state)
  
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length
  
  // Check if all players have ended turn
  const allPlayersEnded = state.players.every(p => p.hasEndedTurn)
  
  if (allPlayersEnded) {
    // All players finished, start enemy turn
    state.phase = 'enemy'
    // Reset hasEndedTurn flags for next round
    state.players.forEach(p => p.hasEndedTurn = false)
  } else {
    // Start next player's turn
    state = startCurrentPlayerTurn(state)
  }
  
  return state
}

export function drawCardsForPlayer(state, playerIndex, amount = 5) {
  state = cloneState(state)
  
  const player = state.players[playerIndex]
  
  for (let i = 0; i < amount; i++) {
    // If draw pile empty, shuffle discard into draw pile
    if (player.drawPile.length === 0) {
      if (player.discardPile.length === 0) break
      player.drawPile = shuffle(player.discardPile)
      player.discardPile = []
    }
    
    const card = player.drawPile.shift()
    if (card) {
      player.hand.push(card)
    }
  }
  
  return state
}

// Helper (re-export from utils if needed)
function shuffle(array) {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// ===== WIN/LOSS CONDITIONS (Multiplayer) =====

export function checkMultiplayerLoss(state) {
  // In co-op: all players dead = loss
  return state.players.every(p => p.currentHealth <= 0)
}

export function checkMultiplayerWin(state) {
  // All enemies defeated
  return state.enemies.every(e => e.currentHealth <= 0)
}

