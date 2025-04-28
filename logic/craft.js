import { character } from "./mainCharacter.js";
import { updateUI } from "./ui.js";

export function doCraft() {
    console.log("Craft action performed.");
    // Decrease gold by 5 units (adjust this value as needed)
    character.modifyStat("gold", -5);
    updateUI();
}