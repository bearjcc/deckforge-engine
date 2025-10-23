# DeckForge Examples

This folder contains complete, working game examples that demonstrate different uses of the DeckForge engine.

## Available Examples

### 1. Playing Cards (`playing-cards/`)

**Theme:** Standard playing cards (generic, no copyright)  
**Complexity:** Basic  
**Demonstrates:**
- Simple combat system
- Basic cards (Strike, Defend)
- Enemy with intents
- Energy system

**How to use:**
```bash
# Already loaded by default in public/index.html
# Or copy to customize:
cp -r examples/playing-cards content/my-custom-game
```

## Creating Your Own Example

1. Copy an existing example as a template
2. Modify the JSON files:
   - `config.json` - Game settings
   - `cards.json` - Your cards
   - `enemies.json` - Your enemies
   - `encounters.json` - Enemy arrangements
   - `game-data.json` - Starting deck
3. Add images to `images/` (optional)
4. Test by loading in the engine

## Example Structure

```
your-game/
├── config.json          # Game configuration
├── cards.json           # All card definitions
├── enemies.json         # All enemy definitions
├── encounters.json      # Enemy encounters
├── game-data.json       # Starting deck, other data
├── images/              # Card art, enemy art (optional)
│   ├── cards/
│   └── enemies/
└── README.md            # Description of your game
```

## Validation

All examples are validated against JSON schemas:
- `schemas/config-schema.json`
- `schemas/card-schema.json`
- `schemas/enemy-schema.json`

Run `npm run validate` to check your content.

## Sharing Your Example

Created something cool? Share it!

1. Create a pull request to add it to `examples/`
2. Or publish as a separate repo and link here
3. Tag it with `#deckforge` so others can find it

---

**Happy creating!** 🎮

