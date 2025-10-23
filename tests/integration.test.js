/**
 * DeckForge Integration Tests
 * 
 * Tests complete game scenarios
 */

import {createGame} from '../public/engine/game.js'

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

// ===== INTEGRATION TESTS =====

test('Full game flow: create game, play card, end turn', () => {
  const config = {
    gameName: 'Test Game',
    version: '1.0.0',
    startingEnergy: 3,
    startingHealth: 50,
    currencies: [{id: 'gold', name: 'Gold', startingAmount: 0}]
  }
  
  const cards = [
    {
      cardId: 'strike',
      name: 'Strike',
      type: 'attack',
      rarity: 'starter',
      energyCost: 1,
      damage: 6,
      target: 'enemy0',
      description: 'Deal 6 damage',
      icon: '⚔️'
    },
    {
      cardId: 'defend',
      name: 'Defend',
      type: 'skill',
      rarity: 'starter',
      energyCost: 1,
      block: 5,
      target: 'player',
      description: 'Gain 5 block',
      icon: '🛡️'
    }
  ]
  
  const enemies = [
    {
      enemyId: 'test_enemy',
      name: 'Test Enemy',
      type: 'monster',
      maxHealth: 30,
      intents: [
        {type: 'attack', damage: 5, description: 'Attack for 5', icon: '⚔️'}
      ],
      icon: '👹'
    }
  ]
  
  const encounters = [
    {encounterId: 'test', enemies: ['test_enemy']}
  ]
  
  const contentData = {
    cards,
    enemies,
    encounters,
    startingDeck: ['strike', 'strike', 'defend']
  }
  
  // Create game
  const game = createGame(config, contentData)
  
  // Verify initial state
  assertEqual(game.state.phase, 'player')
  assertEqual(game.state.hand.length, 3)
  assertEqual(game.state.player.currentEnergy, 3)
  assertEqual(game.state.enemies.length, 1)
  assertEqual(game.state.enemies[0].currentHealth, 30)
  
  // Play a Strike card
  const strikeCard = game.state.hand.find(c => c.cardId === 'strike')
  if (strikeCard) {
    game.playCard(strikeCard.id, 'enemy0')
    assertEqual(game.state.player.currentEnergy, 2, 'Energy should decrease')
    assertEqual(game.state.enemies[0].currentHealth, 24, 'Enemy should take damage')
  }
  
  // End turn (this ends player turn, executes enemy turn, and starts next player turn)
  const healthBefore = game.state.player.currentHealth
  game.endTurn()
  
  // After endTurn, new turn has started with new hand drawn
  assertEqual(game.state.turn, 2, 'Turn should increment')
  assertTrue(game.state.hand.length > 0, 'Should have new hand for next turn')
  
  // Player should have taken damage from enemy
  assertTrue(game.state.player.currentHealth < healthBefore, 'Player should have taken damage')
})

test('Win condition: defeat all enemies', () => {
  const config = {
    gameName: 'Win Test',
    version: '1.0.0',
    startingEnergy: 10,
    startingHealth: 100
  }
  
  const cards = [{
    cardId: 'mega_strike',
    name: 'Mega Strike',
    type: 'attack',
    rarity: 'common',
    energyCost: 1,
    damage: 50,
    target: 'enemy0',
    description: 'Deal 50 damage',
    icon: '💥'
  }]
  
  const enemies = [{
    enemyId: 'weak_enemy',
    name: 'Weak Enemy',
    type: 'monster',
    maxHealth: 20,
    intents: [{type: 'attack', damage: 1, description: 'Weak attack'}],
    icon: '🐛'
  }]
  
  const contentData = {
    cards,
    enemies,
    encounters: [{encounterId: 'test', enemies: ['weak_enemy']}],
    startingDeck: ['mega_strike']
  }
  
  const game = createGame(config, contentData)
  
  // Play the card - should kill enemy
  const card = game.state.hand[0]
  game.playCard(card.id, 'enemy0')
  
  // Should auto-detect win
  assertTrue(game.state.gameOver, 'Game should be over')
  assertTrue(game.state.victory, 'Should be victory')
})

test('Loss condition: player death', () => {
  const config = {
    gameName: 'Loss Test',
    version: '1.0.0',
    startingEnergy: 3,
    startingHealth: 5  // Very low health
  }
  
  const cards = [{
    cardId: 'weak_strike',
    name: 'Weak Strike',
    type: 'attack',
    rarity: 'starter',
    energyCost: 1,
    damage: 1,
    target: 'enemy0',
    description: 'Deal 1 damage',
    icon: '🗡️'
  }]
  
  const enemies = [{
    enemyId: 'strong_enemy',
    name: 'Strong Enemy',
    type: 'monster',
    maxHealth: 100,
    intents: [{type: 'attack', damage: 10, description: 'Heavy attack'}],
    icon: '💀'
  }]
  
  const contentData = {
    cards,
    enemies,
    encounters: [{encounterId: 'test', enemies: ['strong_enemy']}],
    startingDeck: ['weak_strike']
  }
  
  const game = createGame(config, contentData)
  
  // End turn - enemy will attack and kill us
  game.endTurn()
  
  // Should auto-detect loss
  assertTrue(game.state.gameOver, 'Game should be over')
  assertEqual(game.state.victory, false, 'Should be defeat')
  assertEqual(game.state.player.currentHealth, 0, 'Player should be dead')
})

test('Undo functionality works', () => {
  const config = {
    gameName: 'Undo Test',
    version: '1.0.0',
    startingEnergy: 5,
    startingHealth: 50
  }
  
  const cards = [{
    cardId: 'test_card',
    name: 'Test',
    type: 'attack',
    rarity: 'common',
    energyCost: 1,
    damage: 10,
    target: 'enemy0',
    description: 'Test',
    icon: '🎴'
  }]
  
  const enemies = [{
    enemyId: 'test',
    name: 'Test',
    type: 'monster',
    maxHealth: 50,
    intents: [{type: 'attack', damage: 5, description: 'Test'}],
    icon: '👹'
  }]
  
  const contentData = {
    cards,
    enemies,
    encounters: [{encounterId: 'test', enemies: ['test']}],
    startingDeck: ['test_card', 'test_card']
  }
  
  const game = createGame(config, contentData)
  
  const initialEnergy = game.state.player.currentEnergy
  const initialEnemyHealth = game.state.enemies[0].currentHealth
  
  // Play a card
  const card = game.state.hand[0]
  game.playCard(card.id, 'enemy0')
  
  // Verify change
  assertTrue(game.state.player.currentEnergy < initialEnergy)
  assertTrue(game.state.enemies[0].currentHealth < initialEnemyHealth)
  
  // Undo
  game.undo()
  
  // Should be back to initial state
  assertEqual(game.state.player.currentEnergy, initialEnergy, 'Energy should be restored')
  assertEqual(game.state.enemies[0].currentHealth, initialEnemyHealth, 'Enemy HP should be restored')
})

test('Save and load functionality', () => {
  const config = {
    gameName: 'Save Test',
    version: '1.0.0',
    startingEnergy: 3,
    startingHealth: 50
  }
  
  const cards = [{
    cardId: 'test',
    name: 'Test',
    type: 'skill',
    rarity: 'common',
    energyCost: 0,
    draw: 1,
    description: 'Draw 1',
    icon: '🎴'
  }]
  
  const enemies = [{
    enemyId: 'test',
    name: 'Test',
    type: 'monster',
    maxHealth: 30,
    intents: [{type: 'attack', damage: 5, description: 'Test'}],
    icon: '👹'
  }]
  
  const contentData = {
    cards,
    enemies,
    encounters: [{encounterId: 'test', enemies: ['test']}],
    startingDeck: ['test']
  }
  
  const game = createGame(config, contentData)
  
  // Modify state
  game.state.turn = 5
  game.state.player.currentHealth = 30
  
  // Save
  const saveData = game.save()
  assertTrue(typeof saveData === 'string', 'Save should return string')
  
  // Modify again
  game.state.turn = 10
  
  // Load
  game.load(saveData)
  
  // Should restore saved state
  assertEqual(game.state.turn, 5, 'Turn should be restored')
  assertEqual(game.state.player.currentHealth, 30, 'Health should be restored')
})

// ===== RUN TESTS =====

console.log('\n🧪 Running DeckForge Integration Tests...\n')

console.log(`\n📊 Results: ${passedTests} passed, ${failedTests} failed\n`)

if (failedTests > 0) {
  process.exit(1)
} else {
  console.log('✅ All integration tests passed!\n')
  process.exit(0)
}

