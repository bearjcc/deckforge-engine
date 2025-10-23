# Creating Your Own Game Content

DeckForge is a generic engine. To create your game, you only need to provide JSON files. No programming required!

## Quick Start: 5 Steps

### 1. Copy the Template

```bash
cp -r examples/playing-cards content/my-game
```

### 2. Edit config.json

Define your game's basic settings:

```json
{
  "gameName": "My Space Adventure",
  "startingEnergy": 3,
  "startingHealth": 50,
  "currencies": [
    {
      "id": "credits",
      "name": "Space Credits",
      "startingAmount": 0
    },
    {
      "id": "fuel",
      "name": "Rocket Fuel",
      "startingAmount": 0
    }
  ]
}
```

### 3. Define Your Cards

Create `cards.json` with your card definitions:

```json
[
  {
    "cardId": "laser_blast",
    "name": "Laser Blast",
    "type": "attack",
    "rarity": "common",
    "energyCost": 1,
    "damage": 8,
    "description": "Fire lasers for 8 damage",
    "icon": "🔫"
  },
  {
    "cardId": "space_credits_card",
    "name": "Mining Operation",
    "type": "skill",
    "rarity": "common",
    "energyCost": 0,
    "currencyGain": {"credits": 3},
    "description": "Gain 3 credits",
    "icon": "💰"
  }
]
```

### 4. Define Your Enemies

Create `enemies.json`:

```json
[
  {
    "enemyId": "alien_scout",
    "name": "Alien Scout",
    "type": "monster",
    "maxHealth": 25,
    "intents": [
      {
        "type": "attack",
        "damage": 6,
        "description": "Attack for 6",
        "icon": "👽"
      }
    ],
    "icon": "👽"
  }
]
```

### 5. Set Starting Deck

In `game-data.json`:

```json
{
  "startingDeck": [
    "laser_blast", "laser_blast", "laser_blast",
    "shield_card", "shield_card", "shield_card",
    "space_credits_card", "space_credits_card"
  ]
}
```

### 6. Create Encounters

In `encounters.json`:

```json
[
  {
    "encounterId": "first_encounter",
    "name": "Alien Contact",
    "enemies": ["alien_scout"]
  }
]
```

## Done!

Load your game by updating the content path in `index.html` or creating a custom HTML file.

## Complete Card Reference

### Card Schema

```typescript
{
  // Identity
  "cardId": string,           // Unique template ID
  "name": string,             // Display name
  
  // Classification
  "type": string,             // "attack" | "skill" | "power" | "ally" | "item"
  "rarity": string,           // "starter" | "common" | "uncommon" | "rare"
  
  // Costs
  "energyCost": number,       // Energy to play (0-3 typical)
  "currencyCost": object,     // Cost to acquire {"gold": 5}
  
  // Effects
  "damage": number,           // Damage dealt
  "block": number,            // Block gained
  "heal": number,             // HP healed
  "draw": number,             // Cards drawn
  "currencyGain": object,     // Resources gained {"gold": 2}
  "powers": object,           // Status effects {"vulnerable": 2}
  
  // Target
  "target": string,           // "player" | "enemy0" | "all enemies"
  
  // Special
  "exhausts": boolean,        // Remove after playing
  "description": string,      // Card text
  "icon": string              // Emoji or image path
}
```

### Enemy Schema

```typescript
{
  "enemyId": string,
  "name": string,
  "type": string,             // "monster" | "boss"
  "maxHealth": number,
  "intents": [
    {
      "type": "attack" | "buff" | "debuff",
      "damage": number,         // If attack
      "powers": object,         // If buff/debuff
      "description": string,
      "icon": string
    }
  ],
  "icon": string
}
```

## Advanced Features

### Powers (Status Effects)

```json
{
  "powers": {
    "vulnerable": 2,    // Take 50% more damage for 2 turns
    "weak": 3,          // Deal 25% less damage for 3 turns
    "strength": 5       // Deal +5 damage (lasts all combat)
  }
}
```

### Multi-Target Cards

```json
{
  "cardId": "whirlwind",
  "name": "Whirlwind",
  "type": "attack",
  "energyCost": 2,
  "damage": 5,
  "target": "all enemies",
  "description": "Deal 5 damage to ALL enemies"
}
```

### Complex Effects

For complex cards, you can define custom logic (requires JavaScript):

```javascript
// In your custom content file
export const customCards = {
  special_card: {
    onPlay: (state, targets) => {
      // Custom effect here
      return state
    }
  }
}
```

## Example Themes

### Fantasy Quest
- Cards: Sword, Shield, Fireball, Heal
- Enemies: Goblin, Dragon, Dark Wizard
- Currency: Gold, Mana

### Space Adventure
- Cards: Laser, Shield, Hyperdrive, Repair
- Enemies: Alien, Asteroid, Black Hole
- Currency: Credits, Fuel

### Mystery Detective
- Cards: Investigate, Deduce, Interview, Search
- Enemies: Suspects, Red Herrings, Time Pressure
- Currency: Clues, Confidence

## Tips

1. **Start simple** - 10-15 cards is enough for a playable game
2. **Balance costs** - Higher cost = more powerful
3. **Mix card types** - Attack, defense, utility
4. **Test early** - Play it! Adjust based on feel
5. **Use emojis** - Free, no copyright, instantly recognizable

## Need Help?

- Check `examples/` for complete working examples
- Read the [Engine Specification](engine-specification.md)
- See [Data Schemas](data-schemas.md) for all options
- Open an issue on GitHub

---

**Happy game creating!** 🎮

