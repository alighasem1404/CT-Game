import { Character } from "./character.js";

// Create and export a single instance of Character as the main character for the game
export const character = new Character();

/**
 * Resets the current character by copying over a new Character's properties.
 */
export function resetCharacter() {
    const newChar = new Character();
    Object.assign(character, newChar);
    saveCharacter();
}

/**
 * Save the character's stats to localStorage.
 */
export function saveCharacter() {
    localStorage.setItem("character", JSON.stringify(character.stats));
}

/**
 * Loads the character's stats from localStorage and merges them into the current character.
 */
export function loadCharacter() {
    const stored = localStorage.getItem("character");
    if (stored) {
        const stats = JSON.parse(stored);
        Object.assign(character.stats, stats);
    }
}