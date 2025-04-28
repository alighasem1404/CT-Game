import { character } from "./mainCharacter.js";
import { updateUI } from "./ui.js";

export function doRest() {
    console.log("Rest action performed.");
    // Refill energy to maximum value.
    character.updateStat("energy", character.stats.max_energy);
    updateUI();
}