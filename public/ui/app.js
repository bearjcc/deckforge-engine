/**
 * DeckForge Engine - UI
 * 
 * Game interface following Slay the Spire / Dominion patterns:
 * - Enemy area: Top center
 * - Draw pile: Left side
 * - Discard pile: Right side
 * - Player stats: Bottom left
 * - Hand: Bottom center (fanned cards)
 * - End turn: Bottom right
 */

export function createUI(game, container) {
  function render() {
    const state = game.state
    
    container.innerHTML = `
      <div class="game-board">
        ${renderHeader(state)}
        ${renderDrawPile(state)}
        ${renderEnemyArea(state)}
        ${renderDiscardPile(state)}
        ${renderPlayerArea(state)}
        ${renderHandArea(state)}
        ${renderEndTurnArea(state)}
      </div>
      ${renderGameOver(state)}
    `
    
    attachEventListeners()
  }
  
  function renderHeader(state) {
    return `
      <div class="game-header">
        <div class="game-title">
          <h1>🎴 ${state.config.gameName || 'DeckForge'}</h1>
          <p>${state.config.description || 'Deck-Building Adventure Game'}</p>
        </div>
        <div class="game-stats">
          <div class="stat">
            <div class="stat-label">Turn</div>
            <div class="stat-value">${state.turn}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Phase</div>
            <div class="stat-value">${state.phase}</div>
          </div>
        </div>
      </div>
    `
  }
  
  function renderDrawPile(state) {
    const count = state.drawPile.length
    return `
      <div class="draw-pile">
        <div class="pile-stack">
          ${count > 0 ? '🂠' : '∅'}
        </div>
        <div class="pile-count">Draw<br>${count}</div>
      </div>
    `
  }
  
  function renderDiscardPile(state) {
    const count = state.discardPile.length
    const topCard = state.discardPile[state.discardPile.length - 1]
    return `
      <div class="discard-pile">
        <div class="pile-stack">
          ${topCard ? (topCard.icon || '🎴') : '∅'}
        </div>
        <div class="pile-count">Discard<br>${count}</div>
      </div>
    `
  }
  
  function renderEnemyArea(state) {
    if (state.enemies.length === 0) {
      return `
        <div class="enemy-area">
          <div class="enemy defeated">
            <div class="enemy-icon">💀</div>
            <div class="enemy-name">No Enemies</div>
          </div>
        </div>
      `
    }
    
    const enemy = state.enemies[0]
    const defeated = enemy.currentHealth <= 0
    const intent = enemy.intents[enemy.currentIntentIndex || 0]
    
    return `
      <div class="enemy-area">
        <div class="enemy ${defeated ? 'defeated' : ''}">
          <div class="enemy-icon">${enemy.icon || '👹'}</div>
          <div class="enemy-name">${enemy.name}</div>
          
          <div class="enemy-stats">
            <div class="enemy-stat">
              <div class="enemy-stat-label">HP</div>
              <div class="enemy-stat-value">${enemy.currentHealth}/${enemy.maxHealth}</div>
            </div>
            ${enemy.block ? `
              <div class="enemy-stat">
                <div class="enemy-stat-label">Block</div>
                <div class="enemy-stat-value">${enemy.block}</div>
              </div>
            ` : ''}
          </div>
          
          ${!defeated && intent ? `
            <div class="enemy-intent">
              <div class="intent-label">Next Action</div>
              <div class="intent-action">${intent.icon || ''} ${intent.description}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }
  
  function renderPlayerArea(state) {
    return `
      <div class="player-area">
        <div class="player-health">
          ❤️ ${state.player.currentHealth} / ${state.player.maxHealth}
        </div>
        <div class="player-energy">
          ⚡ ${state.player.currentEnergy} / ${state.player.maxEnergy}
        </div>
        <div class="player-block">
          🛡️ ${state.player.block} Block
        </div>
        
        ${Object.keys(state.player.powers).length > 0 ? `
          <div class="player-powers">
            ${Object.entries(state.player.powers).map(([power, stacks]) => 
              `<div class="power-badge">${power} ${stacks}</div>`
            ).join('')}
          </div>
        ` : ''}
        
        <div class="deck-info">
          Total Deck: ${state.deck.length} cards
        </div>
      </div>
    `
  }
  
  function renderHandArea(state) {
    if (state.gameOver) return '<div class="hand-area"></div>'
    
    return `
      <div class="hand-area">
        <div class="hand">
          ${state.hand.map(card => renderCard(card)).join('')}
        </div>
      </div>
    `
  }
  
  function renderCard(card) {
    return `
      <div class="card ${card.type}" data-card-id="${card.id}" title="${card.description}">
        <div class="card-header">
          <div class="card-type">${card.type}</div>
          <div class="card-cost">${card.energyCost || 0}</div>
        </div>
        <div class="card-icon">${card.icon || '🎴'}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-description">${card.description}</div>
      </div>
    `
  }
  
  function renderEndTurnArea(state) {
    if (state.gameOver) return '<div class="end-turn-area"></div>'
    
    return `
      <div class="end-turn-area">
        <button id="end-turn-btn" class="end-turn-btn">
          End Turn
        </button>
      </div>
    `
  }
  
  function renderGameOver(state) {
    if (!state.gameOver) return ''
    
    return `
      <div class="game-over-overlay">
        <div class="game-over ${state.victory ? 'victory' : 'defeat'}">
          <h2>${state.victory ? '🎉 Victory!' : '💀 Defeat'}</h2>
          <p>${state.victory ? 'You defeated all enemies!' : (state.defeatReason || 'You were defeated.')}</p>
          <button onclick="location.reload()">Play Again</button>
        </div>
      </div>
    `
  }
  
  function attachEventListeners() {
    // Play card - click on card itself
    document.querySelectorAll('.card').forEach(cardEl => {
      cardEl.addEventListener('click', (e) => {
        const cardId = e.currentTarget.dataset.cardId
        try {
          game.playCard(cardId, 'enemy0')
          render()
        } catch (err) {
          console.error(err)
          // Show error briefly
          cardEl.style.border = '3px solid red'
          setTimeout(() => render(), 500)
        }
      })
    })
    
    // End turn button
    const endTurnBtn = document.getElementById('end-turn-btn')
    if (endTurnBtn) {
      endTurnBtn.addEventListener('click', () => {
        game.endTurn()
        render()
      })
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (game.state.gameOver) return
      
      // Press E to end turn
      if (e.key === 'e' || e.key === 'E') {
        game.endTurn()
        render()
      }
      
      // Press 1-9 to play cards by position
      const num = parseInt(e.key)
      if (num >= 1 && num <= 9) {
        const card = game.state.hand[num - 1]
        if (card) {
          try {
            game.playCard(card.id, 'enemy0')
            render()
          } catch (err) {
            console.log('Cannot play card:', err.message)
          }
        }
      }
    })
  }
  
  // Initial render
  render()
  
  return {
    render
  }
}



