import { character } from "./mainCharacter.js";

export function updateUI() {
    // If the character has an occupation property, update its display.
    if ('occupation' in character) {
        const occupationEl = document.getElementById("occupation-value");
        if (occupationEl) {
            occupationEl.textContent = character.occupation;
        }
    }
    
    // Shorthand for the character's stats
    const stats = character.stats;
    
    // Update stat displays with the current values from character.stats
    document.getElementById("energy-value").textContent = stats.energy;
    document.getElementById("health-value").textContent = stats.health;
    document.getElementById("food-value").textContent = stats.food;
    document.getElementById("drink-value").textContent = stats.drink;
    document.getElementById("copper-value").textContent = stats.copper;
    document.getElementById("silver-value").textContent = stats.silver;
    document.getElementById("gold-value").textContent = stats.gold;
    document.getElementById("reputation-value").textContent = stats.reputation;
    document.getElementById("strength-value").textContent = stats.strength;
    document.getElementById("dexterity-value").textContent = stats.dexterity;
    document.getElementById("constitution-value").textContent = stats.constitution;
    document.getElementById("intelligence-value").textContent = stats.intelligence;
    document.getElementById("charisma-value").textContent = stats.charisma;
    document.getElementById("wisdom-value").textContent = stats.wisdom;
}