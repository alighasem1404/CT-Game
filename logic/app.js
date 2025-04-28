import { doWork } from "./work.js";
import { doRest } from "./rest.js";
import { doSocialise } from "./socialise.js";
import { doExplore } from "./explore.js";
import { doCraft } from "./craft.js";
import { doTrain } from "./train.js";
import { updateUI } from "./ui.js";
import { character, resetCharacter, loadCharacter, saveCharacter } from "./mainCharacter.js";

document.addEventListener("DOMContentLoaded", () => {
    // Load character from localStorage if it exists.
    loadCharacter();

    // Setup event listeners for action buttons
    const actionsBtns = document.querySelectorAll(".actions button");
    if (actionsBtns.length >= 6) {
        actionsBtns[0].addEventListener("click", () => {
            doWork();
            updateUI();
            saveCharacter();
        });
        actionsBtns[1].addEventListener("click", () => {
            doRest();
            updateUI();
            saveCharacter();
        });
        actionsBtns[2].addEventListener("click", () => {
            doSocialise();
            updateUI();
            saveCharacter();
        });
        actionsBtns[3].addEventListener("click", () => {
            doExplore();
            updateUI();
            saveCharacter();
        });
        actionsBtns[4].addEventListener("click", () => {
            doCraft();
            updateUI();
            saveCharacter();
        });
        actionsBtns[5].addEventListener("click", () => {
            doTrain();
            updateUI();
            saveCharacter();
        });
    }

    // New Character button event listener:
    const newCharBtn = document.getElementById("new-character-button");
    if (newCharBtn) {
        newCharBtn.addEventListener("click", () => {
            resetCharacter();
            updateUI();
        });
    }

    // Initialize UI with character parameters
    updateUI();

    // Retrieve and display the saved custom value
    const savedValue = localStorage.getItem('customValue');
    const displayElement = document.getElementById('saved-value-display');
    const inputElement = document.getElementById('custom-value');

    if (savedValue) {
        displayElement.textContent = `Saved Value: ${savedValue}`;
    }

    // Save the custom value on button click
    document.getElementById('save-value').addEventListener('click', () => {
        const value = inputElement.value;
        if (value) {
            localStorage.setItem('customValue', value);
            displayElement.textContent = `Saved Value: ${value}`;
            inputElement.value = '';
        }
    });
});

function togglePopup() {
    const popup = document.getElementById('popup-buttons');
    if (popup.style.display === 'flex') {
        popup.style.display = 'none';
    } else {
        popup.style.display = 'flex';
    }
}