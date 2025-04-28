import { character } from "./mainCharacter.js";
import { updateUI } from "./ui.js";

export function doSocialise() {
    console.log("Socialise action performed.");
    // Increase reputation by 1 (or adjust the value as needed)
    character.modifyStat("reputation", 1);
    updateUI();
}