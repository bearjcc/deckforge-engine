# DeckForge Engine - Architecture

## Overview

DeckForge uses a **functional, data-driven architecture** where all game logic is separated from content.

```
┌─────────────────────────────────────────┐
│           USER CONTENT (JSON)           │
│  cards.json  enemies.json  config.json  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          ENGINE (JavaScript)            │
│    state.js  actions.js  game.js        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│            UI (React-like)              │
│         Renders current state           │
└─────────────────────────────────────────┘
```

## Core Principles

### 1. Immutable State

All game state is stored in a single object. State is **never** mutated directly.

```javascript
// ❌ Bad
state.player.health -= 5

// ✅ Good
state = dealDamage(state, target, 5)
```

**Benefits:**
- Easy undo/redo
- Time-travel debugging
- Network sync
- Predictable updates

### 2. Action-Based Updates

All changes happen through **action functions**.

```javascript
// Every action:
function someAction(state, params) {
  const newState = cloneState(state)  // Copy
  // ... modify newState ...
  return newState                      // Return new
}
```

### 3. Data-Driven Content

**Zero hard-coded game content.** Everything comes from JSON.

```javascript
// Engine doesn't know about "Strike" or "Fireball"
// It only knows about:
{
  damage: 6,
  energyCost: 1,
  target: 'enemy0'
}
```

## File Structure

```
public/
├── engine/          # Core game logic
│   ├── state.js     # State structure & initialization
│   ├── actions.js   # All game actions
│   ├── game.js      # High-level API
│   ├── utils.js     # Helper functions
│   └── validator.js # JSON validation
│
├── ui/              # User interface
│   ├── app.js       # Main UI component
│   └── styles.css   # Styling
│
├── content/         # Demo game content
│   ├── config.json
│   ├── cards.json
│   ├── enemies.json
│   ├── encounters.json
│   └── game-data.json
│
└── index.html       # Entry point
```

## State Structure

```typescript
GameState = {
  // Meta
  gameId: string
  turn: number
  phase: 'start' | 'enemy' | 'player' | 'cleanup' | 'gameover'
  
  // Player
  player: {
    maxEnergy: number
    currentEnergy: number
    maxHealth: number
    currentHealth: number
    block: number
    powers: {[powerName]: stacks}
    currency: {[currencyName]: amount}
  }
  
  // Deck system
  deck: Card[]          // All owned cards
  drawPile: Card[]      // To be drawn
  hand: Card[]          // In hand
  discardPile: Card[]   // Played/discarded
  exhaustPile: Card[]   // Removed this combat
  
  // Enemies
  enemies: Enemy[]
  
  // Game state
  currentAct: number
  gameOver: boolean
  victory: boolean
  
  // Config
  config: GameConfig
}
```

## Game Loop

```
START GAME
    ↓
┌───────────────┐
│  PLAYER TURN  │
│  - Reset energy│
│  - Draw cards  │
│  - Play cards  │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│   END TURN    │
│  - Discard hand│
│  - Update powers│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  ENEMY TURN   │
│  - Each enemy  │
│    executes    │
│    intent      │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ CHECK WIN/LOSS│
│  - All enemies │
│    dead? WIN   │
│  - Player dead?│
│    LOSS        │
└───────┬───────┘
        │
        ▼
    Repeat
```

## Adding New Features

### To Add a New Card Effect:

1. Add property to Card schema (`schemas/card-schema.json`)
2. Handle in `playCard` function (`engine/actions.js`)
3. Document in `docs/CREATING-CONTENT.md`
4. Add test in `tests/engine.test.js`

### To Add a New Game Mechanic:

1. Add to GameState (`engine/state.js`)
2. Create action function (`engine/actions.js`)
3. Call from game loop (`engine/game.js`)
4. Update UI to show it (`ui/app.js`)
5. Document and test

## Extension Points

The engine is designed to be extended:

- **Custom card effects:** Add callback functions
- **New enemy behaviors:** Extend intent system
- **Progression systems:** Add act/era logic
- **Market systems:** Add acquisition logic
- **Map systems:** Add dungeon/path logic

All extensions keep engine-content separation!

## Performance

- **State cloning:** O(n) where n = state size
- **Card draw:** O(1) amortized
- **Card play:** O(1)
- **Rendering:** O(hand size)

Game state is small enough that cloning is fast (<1ms).

## Testing

Run tests with: `npm test`

Tests cover:
- State creation
- Card actions (draw, play, discard)
- Combat (damage, block, powers)
- Turn management
- Win/loss conditions
- Utility functions

## Security

- No eval() or Function() constructors
- No remote code execution
- Content is data, not code
- Safe to load user-provided JSON

## Browser Compatibility

- ES6 modules required
- Works in all modern browsers
- No build step needed
- No dependencies required

---

For implementation details, see source code comments.

