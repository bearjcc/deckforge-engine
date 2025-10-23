/**
 * DeckForge Engine - Progression System
 * 
 * Handles:
 * - Multiple encounters per act
 * - Multiple acts
 * - Map/path progression (like Slay the Spire)
 */

import {cloneState} from './state.js'
import {generateCardRewards} from './market.js'

// ===== ENCOUNTER PROGRESSION =====

export function createEncounterMap(encounters, actNumber = 1) {
  return {
    actNumber: actNumber,
    encounters: encounters,
    currentEncounterIndex: 0,
    completedEncounters: []
  }
}

export function startEncounter(state, encounterConfig) {
  state = cloneState(state)
  
  // Load enemies for this encounter
  if (encounterConfig.enemies) {
    state.enemies = encounterConfig.enemies.map(enemyTemplate => ({
      ...enemyTemplate,
      currentHealth: enemyTemplate.maxHealth,
      currentIntentIndex: 0,
      block: 0,
      powers: {}
    }))
  }
  
  // Set encounter metadata
  state.currentEncounter = {
    id: encounterConfig.encounterId || encounterConfig.id,
    type: encounterConfig.type || 'combat',  // 'combat', 'elite', 'boss', 'shop', 'rest'
    name: encounterConfig.name,
    rewards: encounterConfig.rewards
  }
  
  state.phase = 'start'
  
  return state
}

export function completeEncounter(state) {
  state = cloneState(state)
  
  // Mark encounter as complete
  if (state.encounterMap) {
    state.encounterMap.completedEncounters.push(
      state.encounterMap.currentEncounterIndex
    )
  }
  
  // Generate rewards if configured
  if (state.currentEncounter?.rewards && state.config.rewardSystem?.enabled) {
    state.pendingRewards = generateEncounterRewards(state, state.currentEncounter.rewards)
  }
  
  state.phase = 'victory'
  
  return state
}

export function advanceToNextEncounter(state) {
  state = cloneState(state)
  
  if (!state.encounterMap) {
    throw new Error('No encounter map configured')
  }
  
  state.encounterMap.currentEncounterIndex += 1
  
  // Check if act complete
  if (state.encounterMap.currentEncounterIndex >= state.encounterMap.encounters.length) {
    return advanceToNextAct(state)
  }
  
  // Load next encounter
  const nextEncounter = state.encounterMap.encounters[state.encounterMap.currentEncounterIndex]
  return startEncounter(state, nextEncounter)
}

function generateEncounterRewards(state, rewardsConfig) {
  const rewards = {
    gold: rewardsConfig.gold || 0,
    cardChoices: [],
    relics: []
  }
  
  // Generate card rewards
  if (rewardsConfig.cardRewards) {
    const availableCards = state.config.cardPool || []
    rewards.cardChoices = generateCardRewards(
      availableCards,
      rewardsConfig.cardRewards.count || 3,
      rewardsConfig.cardRewards.rarityWeights
    )
  }
  
  return rewards
}

// ===== ACT PROGRESSION =====

export function advanceToNextAct(state) {
  state = cloneState(state)
  
  state.currentAct += 1
  
  // Check if game complete
  if (state.currentAct > (state.config.totalActs || 3)) {
    state.gameOver = true
    state.victory = true
    return state
  }
  
  // Load act configuration
  const actConfig = state.config.acts?.[state.currentAct - 1]
  
  if (actConfig) {
    // Update difficulty scaling
    if (actConfig.enemyHealthMultiplier) {
      state.difficultyMultipliers = state.difficultyMultipliers || {}
      state.difficultyMultipliers.enemyHealth = actConfig.enemyHealthMultiplier
    }
    
    // Load new encounter map for this act
    if (actConfig.encounters) {
      state.encounterMap = createEncounterMap(actConfig.encounters, state.currentAct)
    }
    
    // Unlock new cards
    if (actConfig.unlockedCards) {
      state.config.cardPool = [
        ...(state.config.cardPool || []),
        ...actConfig.unlockedCards
      ]
    }
  }
  
  state.phase = 'act_transition'
  
  return state
}

// ===== PATH/MAP SYSTEM (Slay the Spire style) =====

export function createPathMap(paths) {
  return {
    paths: paths,  // Array of possible paths
    currentPath: 0,
    currentNode: 0,
    visitedNodes: []
  }
}

export function choosePathNode(state, pathIndex, nodeIndex) {
  state = cloneState(state)
  
  if (!state.pathMap) {
    throw new Error('No path map configured')
  }
  
  const node = state.pathMap.paths[pathIndex][nodeIndex]
  
  // Record visited node
  state.pathMap.visitedNodes.push({
    pathIndex,
    nodeIndex,
    nodeType: node.type
  })
  
  state.pathMap.currentPath = pathIndex
  state.pathMap.currentNode = nodeIndex
  
  // Execute node action
  switch (node.type) {
    case 'combat':
      return startEncounter(state, node.encounter)
    
    case 'elite':
      return startEncounter(state, node.encounter)
    
    case 'boss':
      return startEncounter(state, node.encounter)
    
    case 'shop':
      state.phase = 'shop'
      return state
    
    case 'rest':
      state.phase = 'rest'
      return state
    
    case 'event':
      state.phase = 'event'
      state.currentEvent = node.event
      return state
    
    default:
      return state
  }
}

// ===== HELPER FUNCTIONS =====

export function isActComplete(state) {
  if (!state.encounterMap) return false
  return state.encounterMap.currentEncounterIndex >= state.encounterMap.encounters.length
}

export function isGameComplete(state) {
  return state.currentAct > (state.config.totalActs || 3)
}

export function getEncounterProgress(state) {
  if (!state.encounterMap) return {current: 0, total: 0}
  
  return {
    current: state.encounterMap.currentEncounterIndex + 1,
    total: state.encounterMap.encounters.length,
    act: state.currentAct
  }
}

