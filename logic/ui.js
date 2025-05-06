import { character } from "./mainCharacter.js";

export function updateUI() {
    // Helper to set text on every element matching an ID selector
    function setAllById(id, text) {
      document.querySelectorAll(`#${id}`).forEach(el => {
        el.innerHTML = text;
      });
    }
  
    // Update occupation display if available
    if ('occupation' in character) {
      setAllById('occupation-value', character.occupation);
    }
  
    const stats = character.stats;
  
    // Energy and health
    setAllById('energy-value', `${stats.energy}/${stats.max_energy}`);
    setAllById('health-value', `${stats.health}/${stats.max_health}`);
  
    // Other stats
    setAllById('food-value', stats.food);
    setAllById('drink-value', stats.drink);
    setAllById('copper-value', stats.copper);
    setAllById('silver-value', stats.silver);
    setAllById('gold-value', stats.gold);
    setAllById('reputation-value', stats.reputation);
    setAllById('strength-value', stats.strength);
    setAllById('dexterity-value', stats.dexterity);
    setAllById('constitution-value', stats.constitution);
    setAllById('intelligence-value', stats.intelligence);
    setAllById('charisma-value', stats.charisma);
    setAllById('wisdom-value', stats.wisdom);
    const skillsList = Object.entries(character.skills)
      .map(([name, level]) => `<li><span>${name}</span> <span>${level}</span></li>`)
      .join('');
    setAllById('skills-value', skillsList);
  }
  