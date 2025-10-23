/**
 * DeckForge Multiplayer Tests
 * 
 * Tests co-op and competitive multiplayer (like Hogwarts Battle)
 */

import {createPlayer, initializePlayers, startCurrentPlayerTurn, endCurrentPlayerTurn, advanceToNextPlayer, checkMultiplayerLoss, checkMultiplayerWin} from '../public/engine/multiplayer.js'
import {createInitialState} from '../public/engine/state.js'

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

// ===== PLAYER CREATION TESTS =====

test('createPlayer creates valid player', () => {
  const player = createPlayer(
    {name: 'Harry', character: 'wizard'},
    {startingEnergy: 3, startingHealth: 50}
  )
  
  assertEqual(player.name, 'Harry')
  assertEqual(player.character, 'wizard')
  assertEqual(player.maxEnergy, 3)
  assertEqual(player.maxHealth, 50)
  assertTrue(Array.isArray(player.hand))
  assertTrue(Array.isArray(player.deck))
})

test('initializePlayers creates player array', () => {
  const state = createInitialState()
  
  const playerConfigs = [
    {name: 'Harry'},
    {name: 'Ron'},
    {name: 'Hermione'}
  ]
  
  const newState = initializePlayers(state, playerConfigs)
  
  assertEqual(newState.players.length, 3)
  assertEqual(newState.players[0].name, 'Harry')
  assertEqual(newState.players[1].name, 'Ron')
  assertEqual(newState.players[2].name, 'Hermione')
  assertTrue(newState.players[0].isActive, 'First player should be active')
  assertEqual(newState.currentPlayerIndex, 0)
})

// ===== TURN MANAGEMENT TESTS =====

test('startCurrentPlayerTurn activates player and draws cards', () => {
  const state = createInitialState()
  
  state.players = [
    createPlayer({name: 'P1'}),
    createPlayer({name: 'P2'})
  ]
  state.currentPlayerIndex = 0
  
  // Give player some cards to draw
  state.players[0].drawPile = [
    {id: 'c1'}, {id: 'c2'}, {id: 'c3'}, {id: 'c4'}, {id: 'c5'}
  ]
  
  const newState = startCurrentPlayerTurn(state)
  
  assertTrue(newState.players[0].isActive)
  assertEqual(newState.players[0].hand.length, 5)
  assertEqual(newState.players[0].currentEnergy, newState.players[0].maxEnergy)
})

test('endCurrentPlayerTurn discards hand and resets currency', () => {
  const state = createInitialState({
    currencies: [{id: 'gold', startingAmount: 0}]
  })
  
  state.players = [createPlayer({name: 'P1'}, state.config)]
  state.currentPlayerIndex = 0
  
  state.players[0].hand = [{id: 'c1'}, {id: 'c2'}]
  state.players[0].currency.gold = 10
  
  const newState = endCurrentPlayerTurn(state)
  
  assertEqual(newState.players[0].hand.length, 0)
  assertEqual(newState.players[0].discardPile.length, 2)
  assertEqual(newState.players[0].currency.gold, 0, 'Currency should reset')
  assertTrue(newState.players[0].hasEndedTurn)
})

test('advanceToNextPlayer cycles through players', () => {
  const state = createInitialState()
  
  state.players = [
    createPlayer({name: 'P1'}),
    createPlayer({name: 'P2'}),
    createPlayer({name: 'P3'})
  ]
  state.currentPlayerIndex = 0
  state.players[0].hasEndedTurn = true
  
  const newState = advanceToNextPlayer(state)
  
  assertEqual(newState.currentPlayerIndex, 1, 'Should advance to player 2')
})

test('advanceToNextPlayer starts enemy turn when all players done', () => {
  const state = createInitialState()
  
  state.players = [
    createPlayer({name: 'P1'}),
    createPlayer({name: 'P2'})
  ]
  state.currentPlayerIndex = 1
  state.players[0].hasEndedTurn = true
  state.players[1].hasEndedTurn = true
  
  const newState = advanceToNextPlayer(state)
  
  assertEqual(newState.phase, 'enemy', 'Should start enemy turn')
  assertEqual(newState.players[0].hasEndedTurn, false, 'Flags should reset')
})

// ===== WIN/LOSS CONDITION TESTS =====

test('checkMultiplayerLoss returns true when all players dead', () => {
  const state = createInitialState()
  
  state.players = [
    {...createPlayer(), currentHealth: 0},
    {...createPlayer(), currentHealth: 0}
  ]
  
  assertTrue(checkMultiplayerLoss(state))
})

test('checkMultiplayerLoss returns false when any player alive', () => {
  const state = createInitialState()
  
  state.players = [
    {...createPlayer(), currentHealth: 10},
    {...createPlayer(), currentHealth: 0}
  ]
  
  assertEqual(checkMultiplayerLoss(state), false)
})

test('checkMultiplayerWin returns true when all enemies dead', () => {
  const state = createInitialState()
  
  state.enemies = [
    {currentHealth: 0},
    {currentHealth: 0}
  ]
  
  assertTrue(checkMultiplayerWin(state))
})

test('checkMultiplayerWin returns false when any enemy alive', () => {
  const state = createInitialState()
  
  state.enemies = [
    {currentHealth: 10},
    {currentHealth: 0}
  ]
  
  assertEqual(checkMultiplayerWin(state), false)
})

// ===== RUN TESTS =====

console.log('\n🧪 Running DeckForge Multiplayer Tests...\n')

console.log(`\n📊 Results: ${passedTests} passed, ${failedTests} failed\n`)

if (failedTests > 0) {
  process.exit(1)
} else {
  console.log('✅ All multiplayer tests passed!\n')
  process.exit(0)
}

