/**
 * DeckForge Progression Tests
 * 
 * Tests encounter sequences and act progression
 */

import {createEncounterMap, startEncounter, completeEncounter, advanceToNextEncounter, advanceToNextAct, isActComplete, getEncounterProgress} from '../public/engine/progression.js'
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

// ===== ENCOUNTER MAP TESTS =====

test('createEncounterMap creates valid map', () => {
  const encounters = [
    {id: 'e1', type: 'combat'},
    {id: 'e2', type: 'elite'},
    {id: 'e3', type: 'boss'}
  ]
  
  const map = createEncounterMap(encounters, 1)
  
  assertEqual(map.actNumber, 1)
  assertEqual(map.encounters.length, 3)
  assertEqual(map.currentEncounterIndex, 0)
  assertTrue(Array.isArray(map.completedEncounters))
})

test('startEncounter loads enemies', () => {
  const state = createInitialState()
  
  const encounter = {
    encounterId: 'test_encounter',
    enemies: [
      {enemyId: 'goblin', name: 'Goblin', maxHealth: 30, intents: []},
      {enemyId: 'orc', name: 'Orc', maxHealth: 50, intents: []}
    ]
  }
  
  const newState = startEncounter(state, encounter)
  
  assertEqual(newState.enemies.length, 2)
  assertEqual(newState.enemies[0].currentHealth, 30)
  assertEqual(newState.enemies[1].currentHealth, 50)
  assertEqual(newState.currentEncounter.id, 'test_encounter')
})

test('completeEncounter marks encounter complete', () => {
  const state = createInitialState()
  
  state.encounterMap = createEncounterMap([{id: 'e1'}], 1)
  state.currentEncounter = {id: 'e1', type: 'combat'}
  
  const newState = completeEncounter(state)
  
  assertEqual(newState.phase, 'victory')
  assertEqual(newState.encounterMap.completedEncounters.length, 1)
})

test('advanceToNextEncounter loads next encounter', () => {
  const state = createInitialState()
  
  const encounters = [
    {id: 'e1', type: 'combat', enemies: [{maxHealth: 20, intents: []}]},
    {id: 'e2', type: 'elite', enemies: [{maxHealth: 40, intents: []}]}
  ]
  
  state.encounterMap = createEncounterMap(encounters, 1)
  state.encounterMap.currentEncounterIndex = 0
  
  const newState = advanceToNextEncounter(state)
  
  assertEqual(newState.encounterMap.currentEncounterIndex, 1)
  assertEqual(newState.currentEncounter.id, 'e2')
})

// ===== ACT PROGRESSION TESTS =====

test('advanceToNextAct increments act number', () => {
  const state = createInitialState()
  state.currentAct = 1
  
  const newState = advanceToNextAct(state)
  
  assertEqual(newState.currentAct, 2)
  assertEqual(newState.phase, 'act_transition')
})

test('advanceToNextAct triggers victory when acts complete', () => {
  const state = createInitialState()
  state.config.totalActs = 3
  state.currentAct = 3
  
  const newState = advanceToNextAct(state)
  
  assertEqual(newState.currentAct, 4)
  assertTrue(newState.gameOver)
  assertTrue(newState.victory)
})

test('advanceToNextAct loads new encounter map', () => {
  const state = createInitialState()
  state.currentAct = 1
  state.config.acts = [
    {encounters: [{id: 'act1_e1'}]},
    {encounters: [{id: 'act2_e1'}, {id: 'act2_e2'}]}
  ]
  
  const newState = advanceToNextAct(state)
  
  assertEqual(newState.encounterMap.actNumber, 2)
  assertEqual(newState.encounterMap.encounters.length, 2)
})

test('advanceToNextAct unlocks new cards', () => {
  const state = createInitialState()
  state.currentAct = 1
  state.config.cardPool = [{cardId: 'basic1'}]
  state.config.acts = [
    {},
    {unlockedCards: [{cardId: 'advanced1'}, {cardId: 'advanced2'}]}
  ]
  
  const newState = advanceToNextAct(state)
  
  assertEqual(newState.config.cardPool.length, 3, 'Should have original + unlocked')
  assertTrue(newState.config.cardPool.some(c => c.cardId === 'advanced1'))
})

// ===== HELPER FUNCTION TESTS =====

test('isActComplete returns true when all encounters done', () => {
  const state = createInitialState()
  
  state.encounterMap = createEncounterMap([{id: 'e1'}, {id: 'e2'}], 1)
  state.encounterMap.currentEncounterIndex = 2
  
  assertTrue(isActComplete(state))
})

test('isActComplete returns false when encounters remain', () => {
  const state = createInitialState()
  
  state.encounterMap = createEncounterMap([{id: 'e1'}, {id: 'e2'}], 1)
  state.encounterMap.currentEncounterIndex = 0
  
  assertEqual(isActComplete(state), false)
})

test('getEncounterProgress returns current progress', () => {
  const state = createInitialState()
  state.currentAct = 2
  state.encounterMap = createEncounterMap([{}, {}, {}], 2)
  state.encounterMap.currentEncounterIndex = 1
  
  const progress = getEncounterProgress(state)
  
  assertEqual(progress.current, 2)
  assertEqual(progress.total, 3)
  assertEqual(progress.act, 2)
})

// ===== MULTIPLE ENCOUNTERS PER ACT FLOW =====

test('Full act flow: multiple encounters', () => {
  const state = createInitialState()
  state.config.totalActs = 3  // Configure total acts to prevent auto-win
  
  const encounters = [
    {id: 'e1', type: 'combat', enemies: [{maxHealth: 20, intents: []}]},
    {id: 'e2', type: 'combat', enemies: [{maxHealth: 25, intents: []}]},
    {id: 'e3', type: 'boss', enemies: [{maxHealth: 100, intents: []}]}
  ]
  
  let newState = state
  newState.encounterMap = createEncounterMap(encounters, 1)
  
  // Start first encounter
  newState = startEncounter(newState, encounters[0])
  assertEqual(newState.enemies[0].maxHealth, 20)
  
  // Complete and advance
  newState = completeEncounter(newState)
  const encounter1Index = newState.encounterMap.currentEncounterIndex
  newState = advanceToNextEncounter(newState)
  assertEqual(newState.encounterMap.currentEncounterIndex, 1)
  
  // Complete second
  newState = completeEncounter(newState)
  newState = advanceToNextEncounter(newState)
  assertEqual(newState.encounterMap.currentEncounterIndex, 2)
  
  // Complete boss - should advance to act 2 (not check if act 1 complete)
  newState = completeEncounter(newState)
  
  // Calling advanceToNextEncounter after boss should advance to act 2
  newState = advanceToNextEncounter(newState)
  assertEqual(newState.currentAct, 2, 'Should have advanced to act 2')
  assertEqual(newState.phase, 'act_transition')
})

// ===== RUN TESTS =====

console.log('\n🧪 Running DeckForge Progression Tests...\n')

console.log(`\n📊 Results: ${passedTests} passed, ${failedTests} failed\n`)

if (failedTests > 0) {
  process.exit(1)
} else {
  console.log('✅ All progression tests passed!\n')
  process.exit(0)
}

