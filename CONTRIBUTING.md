# Contributing to DeckForge

Thanks for your interest in contributing! 🎉

## Ways to Contribute

### 1. Report Bugs

Found a bug? [Open an issue](https://github.com/bearjcc/deckforge-engine/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment info

### 2. Suggest Features

Have an idea? [Open a discussion](https://github.com/bearjcc/deckforge-engine/discussions) with:
- Use case
- Proposed solution
- Why it's valuable

### 3. Submit Code

Want to code? Great! Follow these steps:

## Development Workflow

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/deckforge-engine.git
cd deckforge-engine
```

### 2. Create Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Edit code in `public/engine/` or `public/ui/`
- Add tests in `tests/`
- Update docs in `docs/`

### 4. Test

```bash
# Run all tests
npm test

# Validate content
npm run validate

# Test in browser
npm start
# Open http://localhost:3000
```

**All tests must pass before submitting!**

### 5. Commit

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new card effect system"
git commit -m "fix: correct damage calculation bug"
git commit -m "docs: improve README examples"
```

### 6. Push & PR

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

## Code Style

### JavaScript

- **ES6 modules** (import/export)
- **Functional style** where possible
- **Immutable patterns** for state
- **Comments** for complex logic
- **JSDoc** for public APIs

### Example:

```javascript
/**
 * Deals damage to target with modifiers.
 * @param {GameState} state - Current game state
 * @param {Target} target - Entity to damage
 * @param {number} amount - Base damage
 * @returns {GameState} Updated state
 */
export function dealDamage(state, target, amount) {
  state = cloneState(state)
  // ... implementation
  return state
}
```

## Testing Guidelines

### Write Tests For:

- ✅ New actions
- ✅ New card effects
- ✅ Game loop changes
- ✅ Win/loss conditions
- ✅ Edge cases

### Test Structure:

```javascript
test('descriptive test name', () => {
  // Arrange
  let state = createInitialState()
  // ... setup
  
  // Act
  state = someAction(state, params)
  
  // Assert
  assertEqual(state.someValue, expectedValue)
})
```

## Documentation

Update docs when you:
- Add new features
- Change APIs
- Add configuration options
- Create new examples

## Content Contributions

### Adding Example Games:

1. Create folder in `examples/your-game/`
2. Include all JSON files
3. Add `README.md` explaining your game
4. Validate with `npm run validate`
5. Submit PR

### Guidelines:

- **No copyrighted content** in main repo
- **Clear licensing** for any assets
- **Documented thoroughly**
- **Tested and playable**

## Questions?

- Open a [Discussion](https://github.com/bearjcc/deckforge-engine/discussions)
- Check existing [Issues](https://github.com/bearjcc/deckforge-engine/issues)

---

**Thanks for helping make DeckForge better!** 🙏

