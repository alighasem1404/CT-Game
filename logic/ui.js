import { character } from "./mainCharacter.js";  // Ensure you export an instance from another file, e.g., mainCharacter.js

export function updateUI() {
    // Update occupation display
    const occupationEl = document.getElementById("occupation-value");
    if (occupationEl) {
        occupationEl.textContent = character.occupation;
    }
    
    // Update stats display
    document.getElementById("energy-value").textContent = character.stats.energy;
    document.getElementById("health-value").textContent = character.stats.health;
    document.getElementById("copper-value").textContent = character.stats.copper;
    document.getElementById("silver-value").textContent = character.stats.silver;
    document.getElementById("gold-value").textContent = character.stats.gold;
    document.getElementById("strength-value").textContent = character.stats.strength;
    document.getElementById("dexterity-value").textContent = character.stats.dexterity;
    document.getElementById("constitution-value").textContent = character.stats.constitution;
    document.getElementById("intelligence-value").textContent = character.stats.intelligence;
    document.getElementById("charisma-value").textContent = character.stats.charisma;
    document.getElementById("wisdom-value").textContent = character.stats.wisdom;
}