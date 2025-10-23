/**
 * DeckForge Market System Tests
 * 
 * Tests both market patterns:
 * 1. In-Combat Market (Dominion/Ascension/OP Games)
 * 2. Post-Combat Rewards (Slay the Spire)
 */

import {createMarketRow, refillMarketRow, acquireFromMarketRow, createFixedMarket, acquireFromFixedMarket, generateCardRewards, resetTurnCurrency, canAffordCard} from '../public/engine/market.js'
import {createInitialState} from '../public/engine/state.js'
import {playCard} from '../public/engine/actions.js'

let passedTests = 0
let failedTests = 0

function test(name, fn) {
  try {
    fn()
    console.log(`✅ ${name}`)
    passedTests++
  } catch (err) {
    console.error(`❌ ${name}`)
    console.error(`   ${err.message}`)
    failedTests++
  }
}

function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}. ${message}`)
  }
}

function assertTrue(value, message = '') {
  if (!value) {
    throw new Error(`Expected true, got ${value}. ${message}`)
  }
}

// ===== MARKET ROW TESTS (Ascension Pattern) =====

test('createMarketRow creates row of specified size', () => {
  const cards = [
    {cardId: 'card1', name: 'Card 1'},
    {cardId: 'card2', name: 'Card 2'},
    {cardId: 'card3', name: 'Card 3'},
    {cardId: 'card4', name: 'Card 4'},
    {cardId: 'card5', name: 'Card 5'},
    {cardId: 'card6', name: 'Card 6'},
    {cardId: 'card7', name: 'Card 7'},
  ]
  
  const market = createMarketRow(cards, 6)
  
  assertEqual(market.type, 'row')
  assertEqual(market.rowSize, 6)
  assertEqual(market.row.length, 6)
  assertEqual(market.deck.length, 1)
  assertTrue(Array.isArray(market.discardPile))
})

test('refillMarketRow refills empty slots', () => {
  const market = {
    type: 'row',
    rowSize: 6,
    row: [{cardId: 'card1'}, {cardId: 'card2'}],  // Only 2 cards
    deck: [{cardId: 'card3'}, {cardId: 'card4'}, {cardId: 'card5'}],
    discardPile: []
  }
  
  const refilled = refillMarketRow(market)
  
  assertEqual(refilled.row.length, 5)  // Should refill to 5 (only 5 total cards)
  assertEqual(refilled.deck.length, 0)  // Deck should be empty
})

test('refillMarketRow reshuffles discard when deck empty', () => {
  const market = {
    type: 'row',
    rowSize: 6,
    row: [{cardId: 'card1'}],
    deck: [],
    discardPile: [{cardId: 'card2'}, {cardId: 'card3'}, {cardId: 'card4'}]
  }
  
  const refilled = refillMarketRow(market)
  
  assertTrue(refilled.row.length > 1, 'Should have refilled from reshuffled discard')
  assertEqual(refilled.discardPile.length, 0, 'Discard should be empty')
})

test('acquireFromMarketRow requires correct currency', () => {
  const state = createInitialState({
    currencies: [{id: 'runes', name: 'Runes', startingAmount: 5}]
  })
  
  state.market = {
    type: 'row',
    rowSize: 3,
    row: [
      {cardId: 'expensive', name: 'Expensive', currencyCost: {runes: 10}},
      {cardId: 'affordable', name: 'Affordable', currencyCost: {runes: 3}}
    ],
    deck: [],
    discardPile: []
  }
  
  // Should throw for expensive card
  try {
    acquireFromMarketRow(state, 0)
    throw new Error('Should have thrown')
  } catch (err) {
    assertTrue(err.message.includes('Not enough runes'))
  }
  
  // Should succeed for affordable card
  const newState = acquireFromMarketRow(state, 1)
  assertEqual(newState.player.currency.runes, 2, 'Should have spent 3 runes')
  assertEqual(newState.deck.length, 1, 'Should have added card to deck')
})

// ===== FIXED MARKET TESTS (Dominion/Hogwarts Battle Pattern) =====

test('createFixedMarket creates stacks with max copies', () => {
  const stacks = [
    {cardId: 'strike', name: 'Strike', maxCopies: 10, cost: {gold: 2}},
    {cardId: 'defend', name: 'Defend', maxCopies: 10, cost: {gold: 2}}
  ]
  
  const market = createFixedMarket(stacks)
  
  assertEqual(market.type, 'fixed')
  assertEqual(market.stacks.length, 2)
  assertEqual(market.stacks[0].remaining, 10)
})

test('acquireFromFixedMarket depletes stack', () => {
  const state = createInitialState({
    currencies: [{id: 'gold', name: 'Gold', startingAmount: 10}]
  })
  
  state.market = createFixedMarket([
    {cardId: 'strike', name: 'Strike', maxCopies: 5, cost: {gold: 2}}
  ])
  
  const newState = acquireFromFixedMarket(state, 'strike')
  
  assertEqual(newState.market.stacks[0].remaining, 4, 'Stack should decrease')
  assertEqual(newState.player.currency.gold, 8, 'Should have spent gold')
  assertEqual(newState.deck.length, 1, 'Should have added to deck')
})

test('acquireFromFixedMarket throws when stack depleted', () => {
  const state = createInitialState({
    currencies: [{id: 'gold', startingAmount: 100}]
  })
  
  state.market = createFixedMarket([
    {cardId: 'strike', maxCopies: 0, cost: {gold: 2}}
  ])
  
  try {
    acquireFromFixedMarket(state, 'strike')
    throw new Error('Should have thrown')
  } catch (err) {
    assertTrue(err.message.includes('depleted'))
  }
})

// ===== POST-COMBAT REWARDS TESTS (Slay the Spire Pattern) =====

test('generateCardRewards returns specified count', () => {
  const cards = [
    {cardId: 'c1', rarity: 'common'},
    {cardId: 'c2', rarity: 'common'},
    {cardId: 'c3', rarity: 'uncommon'},
    {cardId: 'c4', rarity: 'rare'},
    {cardId: 'c5', rarity: 'common'},
  ]
  
  const rewards = generateCardRewards(cards, 3)
  
  assertEqual(rewards.length, 3)
  assertTrue(rewards.every(r => r.rarity !== 'starter'), 'Should not include starters')
})

test('generateCardRewards respects rarity weights', () => {
  const cards = Array.from({length: 50}, (_, i) => ({
    cardId: `card${i}`,
    rarity: i < 40 ? 'common' : 'rare'
  }))
  
  const rewards = generateCardRewards(cards, 10, {common: 1.0, uncommon: 0, rare: 0})
  
  assertTrue(rewards.every(r => r.rarity === 'common'), 'Should only generate commons with 100% weight')
})

test('generateCardRewards avoids duplicates', () => {
  const cards = [
    {cardId: 'c1', rarity: 'common'},
    {cardId: 'c2', rarity: 'common'},
    {cardId: 'c3', rarity: 'common'},
  ]
  
  const rewards = generateCardRewards(cards, 3)
  
  const ids = rewards.map(r => r.cardId)
  const uniqueIds = [...new Set(ids)]
  
  assertEqual(ids.length, uniqueIds.length, 'Should have no duplicates')
})

// ===== CURRENCY TESTS =====

test('Currency resets at turn end (Dominion pattern)', () => {
  const state = createInitialState({
    currencies: [{id: 'influence', name: 'Influence', startingAmount: 0}]
  })
  
  state.player.currency.influence = 10  // Gained during turn
  
  const reset = resetTurnCurrency(state)
  
  assertEqual(reset.player.currency.influence, 0, 'Currency should reset to 0')
})

test('canAffordCard checks currency correctly', () => {
  const player = {
    currency: {gold: 5, runes: 2}
  }
  
  assertTrue(canAffordCard(player, {currencyCost: {gold: 3}}), 'Can afford 3 gold')
  assertTrue(!canAffordCard(player, {currencyCost: {gold: 10}}), 'Cannot afford 10 gold')
  assertTrue(canAffordCard(player, {currencyCost: {gold: 2, runes: 1}}), 'Can afford both')
  assertTrue(!canAffordCard(player, {currencyCost: {gold: 2, runes: 3}}), 'Cannot afford runes')
})

test('Cards can generate currency (for market purchases)', () => {
  const state = createInitialState({
    currencies: [{id: 'influence', startingAmount: 0}]
  })
  
  // Create a card that generates currency
  const currencyCard = {
    id: 'test_currency_card',
    cardId: 'apprentice',
    name: 'Apprentice',
    energyCost: 0,
    currencyGain: {influence: 3},
    description: 'Gain 3 Influence'
  }
  
  state.hand = [currencyCard]
  state.player.currentEnergy = 3
  
  const newState = playCard(state, 'test_currency_card')
  
  assertEqual(newState.player.currency.influence, 3, 'Should have gained currency')
})

// ===== RUN TESTS =====

console.log('\n🧪 Running DeckForge Market System Tests...\n')

console.log(`\n📊 Results: ${passedTests} passed, ${failedTests} failed\n`)

if (failedTests > 0) {
  process.exit(1)
} else {
  console.log('✅ All market tests passed!\n')
  process.exit(0)
}

