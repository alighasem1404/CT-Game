import { character } from "./mainCharacter.js";

export function updateUI() {
    // Update occupation display if available
    if ('occupation' in character) {
        const occupationEl = document.getElementById("occupation-value");
        if (occupationEl) {
            occupationEl.textContent = character.occupation;
        }
    }
    
    // Shorthand for the character's stats
    const stats = character.stats;
    
    // Display energy as "energy/max_energy" and health as "health/max_health"
    document.getElementById("energy-value").textContent = `${stats.energy}/${stats.max_energy}`;
    document.getElementById("health-value").textContent = `${stats.health}/${stats.max_health}`;
    
    // Update other stats displays
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