import { character } from "./mainCharacter.js";
import { updateUI } from "./ui.js";

export function doWork() {
    console.log("Work action performed.");
    // For instance, reduce energy by 2 and increase gold by 10:
    character.modifyStat("energy", -2);
    character.modifyStat("gold", 10);
    updateUI();
}