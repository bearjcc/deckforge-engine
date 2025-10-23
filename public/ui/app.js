/**
 * DeckForge Engine - Simple UI
 * 
 * Minimal UI to demonstrate the engine
 */

export function createUI(game, container) {
  function render() {
    const state = game.state
    
    container.innerHTML = `
      <div class="game-container">
        <div class="header">
          <h1>🎴 DeckForge Engine Demo</h1>
          <p>Generic Deck-Building Adventure Game</p>
        </div>
        
        ${renderGameStatus(state)}
        ${renderEnemy(state)}
        ${renderPlayer(state)}
        ${renderHand(state)}
        ${renderGameOver(state)}
      </div>
    `
    
    attachEventListeners()
  }
  
  function renderGameStatus(state) {
    return `
      <div class="game-status">
        <div class="stat">Turn: ${state.turn}</div>
        <div class="stat">Phase: ${state.phase}</div>
        <div class="stat">Energy: ${state.player.currentEnergy}/${state.player.maxEnergy}</div>
      </div>
    `
  }
  
  function renderEnemy(state) {
    if (state.enemies.length === 0) return ''
    
    const enemy = state.enemies[0]
    if (enemy.currentHealth <= 0) return '<div class="enemy defeated">Enemy Defeated!</div>'
    
    const intent = enemy.intents[enemy.currentIntentIndex || 0]
    
    return `
      <div class="enemy">
        <h3>${enemy.icon || '👹'} ${enemy.name}</h3>
        <div class="enemy-health">
          HP: ${enemy.currentHealth}/${enemy.maxHealth}
          ${enemy.block ? `| Block: ${enemy.block}` : ''}
        </div>
        <div class="enemy-intent">
          <strong>Intent:</strong> ${intent.icon || ''} ${intent.description}
        </div>
      </div>
    `
  }
  
  function renderPlayer(state) {
    return `
      <div class="player">
        <div class="player-health">
          ❤️ HP: ${state.player.currentHealth}/${state.player.maxHealth}
        </div>
        <div class="player-block">
          🛡️ Block: ${state.player.block}
        </div>
        <div class="player-powers">
          ${Object.entries(state.player.powers).map(([power, stacks]) => 
            `<span class="power">${power}: ${stacks}</span>`
          ).join(' ')}
        </div>
        <div class="deck-info">
          Draw: ${state.drawPile.length} | Hand: ${state.hand.length} | Discard: ${state.discardPile.length}
        </div>
      </div>
    `
  }
  
  function renderHand(state) {
    if (state.gameOver) return ''
    
    return `
      <div class="hand">
        <h3>Your Hand:</h3>
        <div class="cards">
          ${state.hand.map(card => `
            <div class="card ${card.type}" data-card-id="${card.id}">
              <div class="card-icon">${card.icon || '🎴'}</div>
              <div class="card-name">${card.name}</div>
              <div class="card-cost">⚡ ${card.energyCost || 0}</div>
              <div class="card-desc">${card.description}</div>
              <button class="play-btn" data-card-id="${card.id}">Play</button>
            </div>
          `).join('')}
        </div>
        <button id="end-turn-btn" class="end-turn-btn">End Turn</button>
      </div>
    `
  }
  
  function renderGameOver(state) {
    if (!state.gameOver) return ''
    
    return `
      <div class="game-over">
        <h2>${state.victory ? '🎉 Victory!' : '💀 Defeat'}</h2>
        <p>${state.victory ? 'You won!' : state.defeatReason || 'You were defeated.'}</p>
        <button onclick="location.reload()">Play Again</button>
      </div>
    `
  }
  
  function attachEventListeners() {
    // Play card buttons
    document.querySelectorAll('.play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cardId = e.target.dataset.cardId
        try {
          game.playCard(cardId, 'enemy0')
          render()
        } catch (err) {
          alert(err.message)
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
  }
  
  // Initial render
  render()
  
  return {
    render
  }
}

