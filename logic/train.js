import { character } from "./mainCharacter.js";
import { updateUI } from "./ui.js";

export function doTrain() {
    console.log("Train action performed.");
    // Increase strength by 1 unit (adjust this value as needed)
    character.modifyStat("strength", 1);
    updateUI();
}