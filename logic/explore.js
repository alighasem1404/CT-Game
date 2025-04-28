import { character } from "./mainCharacter.js";
import { updateUI } from "./ui.js";

export function doExplore() {
    console.log("Explore action performed.");
    // Decrease food and drink by 2 units each
    character.modifyStat("food", -2);
    character.modifyStat("drink", -2);
    updateUI();
}