import { ActionSystem } from './logic/actions.js';
import { character } from './logic/mainCharacter.js';
import { updateGameLog, updateCharacterStats } from './ui.js';

// Initialize game state
window.gameState = {
  timeOfDay: 'morning',
  weather: 'clear',
  currentLocation: 'market'
};

// Load game data
async function loadGameData() {
  try {
    const response = await fetch('actions.json');
    window.gameData = {
      actions: await response.json()
    };
  } catch (error) {
    console.error('Error loading game data:', error);
  }
}

// Handle action selection
async function handleAction(location, primary, secondary = null, variation = null) {
  const result = await ActionSystem.executeAction(location, primary, secondary, variation);
  if (result.success) {
    // Update UI with result message
    updateGameLog(result.message);
    // Update character stats display
    updateCharacterStats();
  } else {
    updateGameLog("You cannot perform this action right now.");
  }
}

// UI update functions
function updateGameLog(message) {
  const gameLog = document.getElementById('gameLog');
  if (gameLog) {
    gameLog.innerHTML += `<p>${message}</p>`;
    gameLog.scrollTop = gameLog.scrollHeight;
  }
}

function updateCharacterStats() {
  const statsDisplay = document.getElementById('characterStats');
  if (statsDisplay) {
    statsDisplay.innerHTML = Object.entries(character.stats)
      .map(([stat, value]) => `<div>${stat}: ${value}</div>`)
      .join('');
  }
}

// Initialize game
document.addEventListener('DOMContentLoaded', async () => {
  await loadGameData();
  // Setup UI event listeners
  setupActionButtons();
});

function setupActionButtons() {
  // Example: Setup action buttons for current location
  const location = window.gameState.currentLocation;
  const locationActions = window.gameData.actions.locations[location]?.actions || [];
  
  locationActions.forEach(action => {
    // Create primary action button
    const primaryBtn = document.createElement('button');
    primaryBtn.textContent = action.primary;
    primaryBtn.onclick = () => handleAction(location, action.primary);
    document.getElementById('actionButtons').appendChild(primaryBtn);

    // Create secondary action buttons if any
    action.secondary?.forEach(sec => {
      const secBtn = document.createElement('button');
      secBtn.textContent = sec.name;
      secBtn.onclick = () => handleAction(location, action.primary, sec.name);
      document.getElementById('actionButtons').appendChild(secBtn);

      // Create variation buttons if any
      sec.variations?.forEach(variation => {
        const varBtn = document.createElement('button');
        varBtn.textContent = variation.name;
        varBtn.onclick = () => handleAction(location, action.primary, sec.name, variation.name);
        document.getElementById('actionButtons').appendChild(varBtn);
      });
    });
  });
} 