/**
 * DeckForge Engine - JSON Validator
 * 
 * Validates game content against schemas
 */

export function validateCard(card) {
  const errors = []
  
  // Required fields
  if (!card.cardId) errors.push('Missing required field: cardId')
  if (!card.name) errors.push('Missing required field: name')
  if (!card.type) errors.push('Missing required field: type')
  if (!card.rarity) errors.push('Missing required field: rarity')
  if (!card.description) errors.push('Missing required field: description')
  
  // Type validation
  const validTypes = ['attack', 'skill', 'power', 'ally', 'item', 'spell', 'trait', 'curse', 'status']
  if (card.type && !validTypes.includes(card.type)) {
    errors.push(`Invalid type: ${card.type}. Must be one of: ${validTypes.join(', ')}`)
  }
  
  // Rarity validation
  const validRarities = ['starter', 'common', 'uncommon', 'rare', 'legendary']
  if (card.rarity && !validRarities.includes(card.rarity)) {
    errors.push(`Invalid rarity: ${card.rarity}. Must be one of: ${validRarities.join(', ')}`)
  }
  
  // Numeric validation
  if (card.energyCost !== undefined && card.energyCost < 0) {
    errors.push('energyCost must be >= 0')
  }
  if (card.damage !== undefined && card.damage < 0) {
    errors.push('damage must be >= 0')
  }
  if (card.block !== undefined && card.block < 0) {
    errors.push('block must be >= 0')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateEnemy(enemy) {
  const errors = []
  
  // Required fields
  if (!enemy.enemyId) errors.push('Missing required field: enemyId')
  if (!enemy.name) errors.push('Missing required field: name')
  if (!enemy.type) errors.push('Missing required field: type')
  if (!enemy.maxHealth) errors.push('Missing required field: maxHealth')
  if (!enemy.intents || enemy.intents.length === 0) {
    errors.push('Missing required field: intents (must have at least 1)')
  }
  
  // Type validation
  const validTypes = ['monster', 'elite', 'boss', 'hazard']
  if (enemy.type && !validTypes.includes(enemy.type)) {
    errors.push(`Invalid type: ${enemy.type}. Must be one of: ${validTypes.join(', ')}`)
  }
  
  // Health validation
  if (enemy.maxHealth !== undefined && enemy.maxHealth < 1) {
    errors.push('maxHealth must be >= 1')
  }
  
  // Intent validation
  if (enemy.intents) {
    enemy.intents.forEach((intent, idx) => {
      if (!intent.type) errors.push(`Intent ${idx}: missing type`)
      if (!intent.description) errors.push(`Intent ${idx}: missing description`)
      
      const validIntentTypes = ['attack', 'defend', 'buff', 'debuff', 'special']
      if (intent.type && !validIntentTypes.includes(intent.type)) {
        errors.push(`Intent ${idx}: invalid type ${intent.type}`)
      }
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateConfig(config) {
  const errors = []
  
  // Required fields
  if (!config.gameName) errors.push('Missing required field: gameName')
  if (!config.version) errors.push('Missing required field: version')
  
  // Version format
  if (config.version && !/^\d+\.\d+\.\d+$/.test(config.version)) {
    errors.push('version must be in format X.Y.Z (e.g., 1.0.0)')
  }
  
  // Numeric validation
  if (config.startingEnergy !== undefined && config.startingEnergy < 0) {
    errors.push('startingEnergy must be >= 0')
  }
  if (config.startingHealth !== undefined && config.startingHealth < 1) {
    errors.push('startingHealth must be >= 1')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function validateAllContent(cards, enemies, config) {
  const results = {
    valid: true,
    errors: []
  }
  
  // Validate config
  const configResult = validateConfig(config)
  if (!configResult.valid) {
    results.valid = false
    results.errors.push({type: 'config', errors: configResult.errors})
  }
  
  // Validate all cards
  cards.forEach((card, idx) => {
    const result = validateCard(card)
    if (!result.valid) {
      results.valid = false
      results.errors.push({
        type: 'card',
        cardId: card.cardId || `index_${idx}`,
        errors: result.errors
      })
    }
  })
  
  // Validate all enemies
  enemies.forEach((enemy, idx) => {
    const result = validateEnemy(enemy)
    if (!result.valid) {
      results.valid = false
      results.errors.push({
        type: 'enemy',
        enemyId: enemy.enemyId || `index_${idx}`,
        errors: result.errors
      })
    }
  })
  
  return results
}

