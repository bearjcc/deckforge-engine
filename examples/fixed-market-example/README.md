# Fixed Market Example (Dominion Pattern)

This example demonstrates the **fixed market stacks** pattern used in:
- **Dominion**
- **Harry Potter: Hogwarts Battle**
- **Toy Story Deck-Building Game**
- **Avatar: The Last Airbender Deck-Building Game**

## How It Works

### Turn Flow

1. **Play cards** to generate:
   - Coins (💰) - used to buy cards
   - Actions (⚡) - used to play more cards
   - Buys (+1 buy allows additional purchases)

2. **View fixed market stacks**:
   - Each card type has its own stack
   - See how many remain in each stack
   - Prices clearly marked

3. **Buy cards** using your coins:
   - Click on stack to buy
   - Spend coins
   - Goes to your discard pile
   - Stack counter decreases

4. **End turn**:
   - **Coins reset to 0!** (must spend this turn)
   - Discard hand
   - Draw new hand (usually 5 cards)

### Key Features

- **Limited stacks** - Cards run out! (usually 10-12 copies per stack)
- **Multiple purchases** - Can buy several cards per turn if you have coins + buys
- **Strategic timing** - Buy engine cards early, victory cards late

### Example Turn

```
Hand: [Copper, Copper, Copper, Estate, Estate]

1. Play 3 Copper → Gain 3 coins
2. Buy Smithy (costs 3 coins)
3. End turn
4. Coins reset to 0
5. Draw 5 new cards (Smithy now in discard, will appear later)
```

## Files

- `config.json` - Game settings with fixed market configuration
- `cards.json` - Market cards + starter cards (Copper, Estate)
- `game-data.json` - Starting deck (7 Copper, 3 Estate)

## Try It!

```bash
# Copy to main content folder
cp -r examples/fixed-market-example/* public/content/

# Run game
npm start
```

---

**This pattern is great for simpler, more predictable games!**

