# DeckForge Engine

**A generic, open-source deck-building adventure game engine for the browser**

Build your own deck-building adventure games like Slay the Spire, Hogwarts Battle, or create something completely new — all without writing game logic code. Just provide JSON content files with your cards, enemies, and rules.

## 🎯 What Is This?

DeckForge is a **content-agnostic game engine** that handles all the mechanics of deck-building adventure games:
- Card playing, drawing, shuffling
- Combat with attacks, defense, status effects
- Enemy AI with intents or automated decks
- Resource management (energy, currency, health)
- **Market systems** (Dominion pattern AND Ascension pattern)
- **Multiplayer support** (1-4 players, co-op or competitive)
- **Progression systems** (multiple encounters, multiple acts)
- Win/loss condition tracking
- Save/load functionality
- Undo/redo support

**You provide:** Card definitions, enemy definitions, game config (all JSON)  
**DeckForge handles:** Everything else

### 🛒 Market Systems

DeckForge supports **two distinct market patterns** used in popular deck-builders:

**1. Market Row (Ascension/Star Realms pattern)**
- Center row of cards visible during combat
- Cards generate currency (Runes, Influence, etc.)
- Spend currency SAME TURN to buy from market
- Currency resets each turn (doesn't persist)
- Perfect for: AGENCY, Ascension-style games

**2. Fixed Market (Dominion/Hogwarts Battle pattern)**
- Fixed stacks of cards with limited copies
- Generate coins/influence from cards
- Buy from stacks during your turn
- Stacks deplete as players purchase
- Perfect for: Simpler, more predictable games

See `examples/market-row-example` and `examples/fixed-market-example` for working demos!

## 🎮 Play the Demo

Open `public/index.html` in your browser to play the generic demo using a standard playing card theme.

**No build step required.** Just open the HTML file.

## 🚀 Quick Start

### Use as-is (Generic Playing Cards)

```bash
git clone https://github.com/bearjcc/deckforge-engine.git
cd deckforge-engine
open public/index.html  # Or just double-click the file
```

### Create Your Own Game

1. **Copy the example content:**
```bash
cp -r examples/playing-cards content/my-game
```

2. **Edit the JSON files:**
```javascript
// content/my-game/config.json
{
  "gameName": "My Awesome Game",
  "theme": "pirates",  // or whatever
  "resources": [
    {"id": "gold", "name": "Gold Coins"},
    {"id": "cannons", "name": "Cannon Power"}
  ],
  ...
}
```

3. **Define your cards:**
```javascript
// content/my-game/cards/my-card.json
{
  "cardId": "pirate_captain",
  "name": "Pirate Captain",
  "type": "ally",
  "currencyCost": {"gold": 5},
  "currencyGain": {"gold": 2, "cannons": 1},
  "description": "Gain 2 Gold and 1 Cannon",
  "image": "cards/pirate_captain.png"
}
```

4. **Play your game:**
- Load content/my-game in the UI
- Everything else handled by engine

## 📖 Documentation

- **[Engine Specification](docs/engine-specification.md)** - Technical architecture
- **[Data Schemas](docs/data-schemas.md)** - JSON structure reference
- **[API Reference](docs/api-reference.md)** - Function documentation
- **[Creating Content](docs/creating-content.md)** - How to make your game

## 🎴 Examples

### Included Examples

**1. Generic Playing Cards** (`examples/playing-cards/`)
- Standard 52-card deck theme
- Simple combat
- Demonstrates all core mechanics
- **No copyright issues** - public domain

**2. Fantasy Adventure** (`examples/fantasy-quest/`)
- Swords & sorcery theme
- Shows progression system
- Monster encounters
- Demonstrates advanced features

**3. Space Exploration** (`examples/space-explorer/`)
- Sci-fi theme
- Mission-based gameplay
- Resource management
- Example of custom mechanics

## 🛠️ Features

### Core Engine

- ✅ **Immutable state management** - Clean, predictable updates
- ✅ **Action-based architecture** - Undo/redo built-in
- ✅ **Data-driven** - No code changes for new content
- ✅ **Flexible card system** - Attacks, skills, powers, allies, items
- ✅ **Enemy AI** - Intent system or automated decks
- ✅ **Status effects** - Buffs, debuffs, powers
- ✅ **Multiple acquisition patterns** - Market row, fixed market, rewards
- ✅ **Progression systems** - Acts, eras, paths, missions
- ✅ **Win/loss conditions** - Customizable per game
- ✅ **Save/load** - JSON serialization
- ✅ **Event system** - Triggers and watchers

### UI Features

- ✅ **Drag-and-drop** card playing
- ✅ **Animations** - Smooth card movement
- ✅ **Responsive design** - Works on mobile
- ✅ **Accessibility** - Keyboard navigation
- ✅ **Sound effects** (optional)
- ✅ **Theme support** - CSS variables for easy restyling

## 🎨 Customization

### What You Can Customize (JSON Only)

- **Cards** - Any effects, costs, types you want
- **Enemies** - Define intents, decks, behaviors
- **Resources** - As many currencies as needed
- **Progression** - Acts, eras, paths, or custom
- **Win conditions** - Defeat enemies, complete objectives, score points
- **Starting deck** - Any cards, any amount
- **Market system** - Fixed, row, or reward-based

### What's Generic (No Changes Needed)

- Game loop
- State management
- Card mechanics
- Combat resolution
- Turn structure
- Save/load system

## 📜 License

**MIT License** - Use for anything, including commercial projects.

The engine is completely free and open-source. Build your dream deck-building game!

### What This Means

- ✅ Use commercially
- ✅ Modify however you want
- ✅ No attribution required (but appreciated!)
- ✅ Build proprietary games on top
- ✅ Sell games you create

**Just don't sue us if something breaks.** 😊

## 🙏 Credits

**Created by:** Joseph C. Caswell (Bear)  
**Inspired by:**
- Slay the Spire (MegaCrit)
- Slay the Web (Oskar Rough)
- Harry Potter: Hogwarts Battle (The OP)
- And many other excellent deck-building games

**Built with:**
- Vanilla JavaScript (ES6+)
- Immer.js (immutable state)
- Preact (minimal React alternative)
- Love for game design

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a PR

**Especially wanted:**
- Additional example content
- Bug fixes
- Performance improvements
- Documentation improvements
- Accessibility enhancements

## 📞 Contact

**Issues:** GitHub Issues  
**Discussions:** GitHub Discussions  
**Website:** https://ursaminor.games

---

**Now go build something awesome!** 🎮



