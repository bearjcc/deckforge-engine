/**
 * Validate Content - Content Validation Script
 * 
 * Validates all JSON content files against schemas
 */

import {validateAllContent} from '../public/engine/validator.js'
import {readFileSync} from 'fs'

const config = JSON.parse(readFileSync('./public/content/config.json', 'utf8'))
const cards = JSON.parse(readFileSync('./public/content/cards.json', 'utf8'))
const enemies = JSON.parse(readFileSync('./public/content/enemies.json', 'utf8'))

console.log('🔍 Validating game content...\n')

const result = validateAllContent(cards, enemies, config)

if (result.valid) {
  console.log('✅ All content is valid!\n')
  console.log(`📊 Stats:`)
  console.log(`   - Config: Valid`)
  console.log(`   - Cards: ${cards.length} validated`)
  console.log(`   - Enemies: ${enemies.length} validated`)
  process.exit(0)
} else {
  console.error('❌ Validation failed!\n')
  result.errors.forEach(err => {
    console.error(`\n${err.type.toUpperCase()}: ${err.cardId || err.enemyId || 'config'}`)
    err.errors.forEach(e => console.error(`  - ${e}`))
  })
  process.exit(1)
}

