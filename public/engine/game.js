/**
 * DeckForge Engine - Main Game Controller
 * 
 * High-level API for controlling the game
 */

import {createInitialState, cloneState} from './state.js'
import * as actions from './actions.js'
import {shuffle, generateId} from './utils.js'

export function createGame(config, contentData) {
  let state = createInitialState(config)
  const history = []
  
  // Add starting deck
  if (contentData.startingDeck) {
    const cards = contentData.startingDeck.map(cardId => {
      const template = contentData.cards.find(c => c.cardId === cardId)
      return {...template, id: generateId('card')}
    })
    state.deck = cards
    state.drawPile = shuffle([...cards])
  }
  
  // Add enemies for first encounter
  if (contentData.encounters && contentData.encounters.length > 0) {
    state.enemies = contentData.encounters[0].enemies.map(enemyId => {
      const template = contentData.enemies.find(e => e.enemyId === enemyId)
      return {
        ...template,
        id: generateId('enemy'),
        currentHealth: template.maxHealth,
        block: 0,
        powers: {},
        currentIntentIndex: 0
      }
    })
  }
  
  // Draw starting hand
  state = actions.startPlayerTurn(state)
  
  return {
    state,
    history,
    
    // Actions
    playCard(cardId, target) {
      this.history.push(cloneState(this.state))
      this.state = actions.playCard(this.state, cardId, target)
      this.checkGameOver()
    },
    
    endTurn() {
      this.history.push(cloneState(this.state))
      this.state = actions.endPlayerTurn(this.state)
      this.state = actions.executeEnemyTurn(this.state)
      this.checkGameOver()
      if (!this.state.gameOver) {
        this.state.turn++
        this.state = actions.startPlayerTurn(this.state)
      }
    },
    
    acquireCard(cardTemplate) {
      this.history.push(cloneState(this.state))
      this.state = actions.acquireCard(this.state, cardTemplate)
    },
    
    checkGameOver() {
      if (actions.checkWinCondition(this.state)) {
        this.state = actions.endGame(this.state, true)
      } else if (actions.checkLossCondition(this.state)) {
        this.state = actions.endGame(this.state, false, 'Player defeated')
      }
    },
    
    undo() {
      if (this.history.length > 0) {
        this.state = this.history.pop()
      }
    },
    
    save() {
      return JSON.stringify(this.state)
    },
    
    load(saveData) {
      this.state = JSON.parse(saveData)
      this.history = []
    }
  }
}

