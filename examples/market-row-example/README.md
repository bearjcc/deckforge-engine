# Market Row Example (Ascension Pattern)

This example demonstrates the **center row market** pattern used in:
- **Ascension: Deck-Building Game**
- **Star Realms**
- Similar to how AGENCY will work!

## How It Works

### Turn Flow

1. **Play cards** to generate resources:
   - Runes (💎) - used to buy heroes/constructs
   - Power (⚔️) - used to defeat monsters

2. **View the market row** - 6 cards visible at all times

3. **Acquire cards** using your runes:
   - Click on card in market
   - Spend runes to acquire it
   - Goes to your discard pile
   - Market refills immediately

4. **Defeat monsters** using your power:
   - Gain rewards (honor points)
   - Remove from market

5. **End turn**:
   - **Currency resets to 0!** (Dominion/Ascension rule)
   - Discard hand
   - Draw new hand
   - Market stays visible

### Key Difference from Slay the Spire

- **In Ascension:** Market is ALWAYS visible during combat
- **In Slay the Spire:** Shop is only between combats

This creates constant decision-making: fight monsters or buy cards?

## Files

- `config.json` - Game settings with market configuration
- `cards.json` - Market cards (heroes, constructs) + starter cards
- `enemies.json` - Monsters that appear in market row
- `game-data.json` - Starting deck configuration

## Try It!

```bash
# Copy to main content folder
cp -r examples/market-row-example/* public/content/

# Run game
npm start
```

---

**This is the pattern AGENCY will use!**

