/**
 * DeckForge Engine Tests
 * 
 * Run with: node tests/engine.test.js
 */

import {createInitialState} from '../public/engine/state.js'
import * as actions from '../public/engine/actions.js'
import {shuffle, getTargets, clamp} from '../public/engine/utils.js'

// Simple test framework
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

// ===== STATE TESTS =====

test('createInitialState creates valid state', () => {
  const state = createInitialState()
  assertEqual(state.turn, 1)
  assertEqual(state.phase, 'start')
  assertEqual(state.gameOver, false)
  assertTrue(Array.isArray(state.hand))
  assertTrue(Array.isArray(state.drawPile))
})

test('createInitialState applies config', () => {
  const config = {
    startingEnergy: 5,
    startingHealth: 100,
    currencies: [{id: 'gold', startingAmount: 50}]
  }
  const state = createInitialState(config)
  assertEqual(state.player.maxEnergy, 5)
  assertEqual(state.player.maxHealth, 100)
  assertEqual(state.player.currency.gold, 50)
})

// ===== CARD ACTIONS TESTS =====

test('drawCards adds cards to hand', () => {
  let state = createInitialState()
  state.drawPile = [
    {id: '1', name: 'Card 1'},
    {id: '2', name: 'Card 2'},
    {id: '3', name: 'Card 3'}
  ]
  
  state = actions.drawCards(state, 2)
  assertEqual(state.hand.length, 2)
  assertEqual(state.drawPile.length, 1)
  assertEqual(state.hand[0].id, '1')
  assertEqual(state.hand[1].id, '2')
})

test('drawCards reshuffles discard when draw empty', () => {
  let state = createInitialState()
  state.drawPile = []
  state.discardPile = [
    {id: '1', name: 'Card 1'},
    {id: '2', name: 'Card 2'}
  ]
  
  state = actions.drawCards(state, 2)
  assertEqual(state.hand.length, 2)
  assertEqual(state.discardPile.length, 0)
  assertTrue(state.drawPile.length >= 0)
})

test('playCard removes from hand and applies effects', () => {
  let state = createInitialState()
  const card = {
    id: 'test_card',
    name: 'Test',
    energyCost: 1,
    damage: 10
  }
  state.hand = [card]
  state.player.currentEnergy = 3
  state.enemies = [{
    id: 'enemy1',
    currentHealth: 50,
    maxHealth: 50,
    block: 0,
    powers: {}
  }]
  
  state = actions.playCard(state, 'test_card', 'enemy0')
  
  assertEqual(state.hand.length, 0, 'Card should be removed from hand')
  assertEqual(state.player.currentEnergy, 2, 'Energy should be spent')
  assertEqual(state.enemies[0].currentHealth, 40, 'Enemy should take damage')
})

test('playCard with block gains block', () => {
  let state = createInitialState()
  const card = {
    id: 'defend_card',
    name: 'Defend',
    energyCost: 1,
    block: 5
  }
  state.hand = [card]
  state.player.currentEnergy = 3
  
  state = actions.playCard(state, 'defend_card')
  
  assertEqual(state.player.block, 5)
})

// ===== COMBAT TESTS =====

test('dealDamage reduces health', () => {
  let state = createInitialState()
  const enemy = {
    id: 'test_enemy',
    currentHealth: 50,
    maxHealth: 50,
    block: 0,
    powers: {}
  }
  
  state = actions.dealDamage(state, enemy, 10)
  assertEqual(enemy.currentHealth, 40)
})

test('dealDamage applies to block first', () => {
  let state = createInitialState()
  const enemy = {
    id: 'test_enemy',
    currentHealth: 50,
    maxHealth: 50,
    block: 8,
    powers: {}
  }
  
  state = actions.dealDamage(state, enemy, 10)
  assertEqual(enemy.block, 0, 'Block should be consumed')
  assertEqual(enemy.currentHealth, 48, 'Overflow damage to health')
})

test('dealDamage with vulnerable increases damage', () => {
  let state = createInitialState()
  const enemy = {
    id: 'test_enemy',
    currentHealth: 50,
    maxHealth: 50,
    block: 0,
    powers: {vulnerable: 1}
  }
  
  state = actions.dealDamage(state, enemy, 10)
  // 10 * 1.5 = 15
  assertEqual(enemy.currentHealth, 35)
})

// ===== TURN MANAGEMENT TESTS =====

test('startPlayerTurn resets energy and draws cards', () => {
  let state = createInitialState()
  state.player.currentEnergy = 0
  state.drawPile = [
    {id: '1'}, {id: '2'}, {id: '3'}, {id: '4'}, {id: '5'}
  ]
  
  state = actions.startPlayerTurn(state)
  
  assertEqual(state.player.currentEnergy, state.player.maxEnergy)
  assertEqual(state.hand.length, 5)
  assertEqual(state.phase, 'player')
})

test('endPlayerTurn discards hand', () => {
  let state = createInitialState()
  state.hand = [
    {id: '1'}, {id: '2'}, {id: '3'}
  ]
  
  state = actions.endPlayerTurn(state)
  
  assertEqual(state.hand.length, 0)
  assertEqual(state.discardPile.length, 3)
})

// ===== WIN/LOSS TESTS =====

test('checkWinCondition returns true when all enemies dead', () => {
  let state = createInitialState()
  state.enemies = [
    {currentHealth: 0},
    {currentHealth: 0}
  ]
  
  const won = actions.checkWinCondition(state)
  assertTrue(won)
})

test('checkWinCondition returns false when enemies alive', () => {
  let state = createInitialState()
  state.enemies = [
    {currentHealth: 10},
    {currentHealth: 0}
  ]
  
  const won = actions.checkWinCondition(state)
  assertEqual(won, false)
})

test('checkLossCondition returns true when player dead', () => {
  let state = createInitialState()
  state.player.currentHealth = 0
  
  const lost = actions.checkLossCondition(state)
  assertTrue(lost)
})

// ===== UTILITY TESTS =====

test('shuffle randomizes array', () => {
  const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const shuffled = shuffle(original)
  
  assertEqual(shuffled.length, original.length)
  // Very unlikely to be in same order
  const isDifferent = shuffled.some((val, idx) => val !== original[idx])
  assertTrue(isDifferent, 'Shuffle should change order')
})

test('getTargets resolves player', () => {
  const state = createInitialState()
  const targets = getTargets(state, 'player')
  
  assertEqual(targets.length, 1)
  assertEqual(targets[0], state.player)
})

test('getTargets resolves enemy0', () => {
  const state = createInitialState()
  state.enemies = [{id: 'e1', currentHealth: 50}]
  const targets = getTargets(state, 'enemy0')
  
  assertEqual(targets.length, 1)
  assertEqual(targets[0].id, 'e1')
})

test('getTargets resolves all enemies', () => {
  const state = createInitialState()
  state.enemies = [
    {id: 'e1', currentHealth: 50},
    {id: 'e2', currentHealth: 30},
    {id: 'e3', currentHealth: 0}  // Dead
  ]
  const targets = getTargets(state, 'all enemies')
  
  assertEqual(targets.length, 2, 'Should only include living enemies')
})

test('clamp constrains values', () => {
  assertEqual(clamp(5, 0, 10), 5)
  assertEqual(clamp(-5, 0, 10), 0)
  assertEqual(clamp(15, 0, 10), 10)
})

// ===== RUN TESTS =====

console.log('\n🧪 Running DeckForge Engine Tests...\n')

// Run all tests
console.log(`\n📊 Results: ${passedTests} passed, ${failedTests} failed\n`)

if (failedTests > 0) {
  process.exit(1)
} else {
  console.log('✅ All tests passed!\n')
  process.exit(0)
}

