# SteamZero JSON Helper

A VS Code extension that provides autocomplete templates for game data entries for SteamZero. Insert a game template and get suggestions for properties like tags, features, ratings, and more.

## ℹ️ About SteamZero

Find the best **fre games** available on **Steam**.

## ✨ Features

- **Quick Game Template**: Type `gametemplate` to instantly insert a game template
- **Autocomplete**: Get suggestions for tags, features, ratings and more
- **Consistent Data Entry**: Ensures all game entries follow the same structure

## 🚀 Getting Started

### Installation

1. Install the extension from the VS Code Marketplace (or install the .vsix file)
2. Download the games.json file from the GitHub repository.
3. Open it with Visual Studio Code

### Basic Usage

1. **Insert a Game Template**
   - Open the `games.json` file
   - Type `gametemplate`
   - Press `Tab` or `Enter` to insert the template
   - Fill in the game details using `Tab` to navigate between fields *(If the autocomplete doesn't show up, press Control+Space)*

2. **Use Autocomplete**
   - For example, when entering tags, you'll see suggestions like "Action", "RPG", "Strategy"

## 📝 Game Template Structure

```json
{
  "name": "", // The game's name
  "icon": "", // Go to https://steamgriddb.com, find your game, press "View Original Steam Assets:, then right-click the "Client Icon" image and press "Copy Image Link". That is the icon.
  "steamUrl": "https://store.steampowered.com/app/(game id)",
  "steamDbUrl": "https://steamdb.info/app/(game id)",
  "description": "", // Copy brief description from Steam
  "rating":  , // Get from Steam. DO NOT PUT IT INTO A STRING.
  "developer": "", // Get from Steam.
  "publisher": "", // Get from Steam.
  "releaseYear": , //Get from Steam. DO NOT PUT IT INTO A STRING.
  "tags": [], // Get them from SteamDB. Put each one into a different string and seperate them with commas.
  "features": ["Single-player", "Multiplayer", "Achievements"] // Get them from SteamDB. Put Categories, Hardware Categories and Accesibility Categories
}
```

## 🐛 Known Issues

None right now. Please report any issues on the [GitHub repository](https://github.com/yourusername/steamzero-game-template/issues).

## 📦 Requirements

- Visual Studio Code version 1.80.0 or higher

## 📜 Release Notes

Check CHANGELOG.md

## 📄 License

MIT License - See LICENSE file for details.