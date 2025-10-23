/**
 * DeckForge Engine - Market Systems
 * 
 * Two main patterns:
 * 1. In-Combat Market (Dominion, Ascension, Hogwarts Battle)
 * 2. Post-Combat Rewards (Slay the Spire)
 */

import {shuffle, generateId} from './utils.js'

// ===== MARKET ROW (Ascension Pattern) =====

export function createMarketRow(cards, rowSize = 6) {
  const shuffledDeck = shuffle([...cards])
  
  return {
    type: 'row',
    rowSize: rowSize,
    row: shuffledDeck.slice(0, rowSize),
    deck: shuffledDeck.slice(rowSize),
    discardPile: []
  }
}

export function refillMarketRow(market) {
  while (market.row.length < market.rowSize) {
    // If deck empty, reshuffle discard
    if (market.deck.length === 0 && market.discardPile.length > 0) {
      market.deck = shuffle(market.discardPile)
      market.discardPile = []
    }
    
    // If still no cards, break
    if (market.deck.length === 0) break
    
    market.row.push(market.deck.shift())
  }
  
  return market
}

export function acquireFromMarketRow(state, cardIndex) {
  if (cardIndex >= state.market.row.length) {
    throw new Error('Invalid card index')
  }
  
  const card = state.market.row[cardIndex]
  
  // Check currency cost
  if (card.currencyCost) {
    Object.entries(card.currencyCost).forEach(([currency, amount]) => {
      if ((state.player.currency[currency] || 0) < amount) {
        throw new Error(`Not enough ${currency}. Need ${amount}, have ${state.player.currency[currency] || 0}`)
      }
    })
  }
  
  // Pay cost
  if (card.currencyCost) {
    Object.entries(card.currencyCost).forEach(([currency, amount]) => {
      state.player.currency[currency] -= amount
    })
  }
  
  // Remove from market
  state.market.row.splice(cardIndex, 1)
  
  // Add to player's discard pile
  const newCard = {...card, id: generateId('card')}
  state.deck.push(newCard)
  state.discardPile.push(newCard)
  
  // Refill market
  state.market = refillMarketRow(state.market)
  
  return state
}

// ===== FIXED MARKET (Dominion, Hogwarts Battle Pattern) =====

export function createFixedMarket(cardStacks) {
  return {
    type: 'fixed',
    stacks: cardStacks.map(stack => ({
      ...stack,
      remaining: stack.maxCopies !== undefined ? stack.maxCopies : 10
    }))
  }
}

export function acquireFromFixedMarket(state, cardId) {
  const stack = state.market.stacks.find(s => s.cardId === cardId)
  
  if (!stack) {
    throw new Error('Card not in market')
  }
  
  if (!stack.remaining || stack.remaining <= 0) {
    throw new Error('Stack depleted')
  }
  
  // Check currency cost
  if (stack.cost) {
    Object.entries(stack.cost).forEach(([currency, amount]) => {
      if ((state.player.currency[currency] || 0) < amount) {
        throw new Error(`Not enough ${currency}`)
      }
    })
  }
  
  // Pay cost
  if (stack.cost) {
    Object.entries(stack.cost).forEach(([currency, amount]) => {
      state.player.currency[currency] -= amount
    })
  }
  
  // Reduce stack
  stack.remaining -= 1
  
  // Get card template
  const cardTemplate = stack.cardTemplate || {cardId, ...stack}
  
  // Add to player's deck
  const newCard = {...cardTemplate, id: generateId('card')}
  state.deck.push(newCard)
  state.discardPile.push(newCard)
  
  return state
}

// ===== POST-COMBAT REWARDS (Slay the Spire Pattern) =====

export function generateCardRewards(availableCards, count = 3, rarityWeights = null) {
  if (!rarityWeights) {
    rarityWeights = {
      common: 0.6,
      uncommon: 0.3,
      rare: 0.1
    }
  }
  
  const rewards = []
  const candidates = availableCards.filter(c => c.rarity !== 'starter')
  
  while (rewards.length < count && candidates.length > 0) {
    // Roll for rarity
    const roll = Math.random()
    let targetRarity
    
    if (roll < rarityWeights.common) {
      targetRarity = 'common'
    } else if (roll < rarityWeights.common + rarityWeights.uncommon) {
      targetRarity = 'uncommon'
    } else {
      targetRarity = 'rare'
    }
    
    // Find cards of that rarity
    const ofRarity = candidates.filter(c => c.rarity === targetRarity)
    
    if (ofRarity.length > 0) {
      const card = ofRarity[Math.floor(Math.random() * ofRarity.length)]
      
      // Avoid duplicates
      if (!rewards.find(r => r.cardId === card.cardId)) {
        rewards.push(card)
      }
    }
  }
  
  return rewards
}

export function takeCardReward(state, cardTemplate) {
  // Add to deck
  const newCard = {...cardTemplate, id: generateId('card')}
  state.deck.push(newCard)
  state.discardPile.push(newCard)
  
  return state
}

// ===== CURRENCY MANAGEMENT =====

export function resetTurnCurrency(state) {
  // Reset all currencies to 0 at turn end (for in-combat markets)
  const currencyIds = state.config.currencies?.map(c => c.id) || []
  
  currencyIds.forEach(id => {
    state.player.currency[id] = 0
  })
  
  return state
}

export function canAffordCard(player, card) {
  if (!card.currencyCost) return true
  
  return Object.entries(card.currencyCost).every(([currency, amount]) => {
    return (player.currency[currency] || 0) >= amount
  })
}

