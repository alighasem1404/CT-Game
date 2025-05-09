//  Define conditionTypes directly in the code
const conditionTypes = {
    // Basic Conditions
    stat_min: { label: 'Stat Minimum', format: 'STAT:value', key: 'stat' },
    stat_max: { label: 'Stat Maximum', format: 'STAT:value', key: 'stat' },
    has_item: { label: 'Has Item', format: 'true/false', key: 'items' },
    item_count: { label: 'Item Count', format: 'item:count', key: 'items' },
    equipped_item: { label: 'Equipped Item', format: 'true/false', key: 'items' },
    // Quest & Story
    quest_completed: { label: 'Quest Completed', format: 'true/false', key: 'quests' },
    quest_started: { label: 'Quest Started', format: 'true/false', key: 'quests' },
    event_triggered: { label: 'Event Triggered', format: 'true/false', key: 'events' },
    // Faction & NPCs
    faction_standing: { label: 'Faction Standing', format: 'faction:value', key: 'factions' },
    has_companion: { label: 'Has Companion', format: 'true/false', key: 'NPCs' },
    // Time & World
    time_of_day: { label: 'Time of Day', format: 'true/false', key: 'time_of_day' },
    is_weather: { label: 'Weather', format: 'true/false', key: 'weather' },
    is_area_visited: { label: 'Area Visited', format: 'true/false', key: 'Locations' },
    // Player State
    has_status: { label: 'Has Status', format: 'true/false', key: 'status' },
    is_class: { label: 'Is Class', format: 'true/false', key: 'classes' },
    is_race: { label: 'Is Race', format: 'true/false', key: 'race' }
};

let conditionKeys = {}; // To store the loaded keys

// Function to load condition keys from JSON file
async function loadConditionKeys() {
    try {
        const keysResponse = await fetch('condition_keys.json');
        if (!keysResponse.ok) {
            throw new Error(`Failed to fetch condition keys: ${keysResponse.status}`);
        }
        conditionKeys = await keysResponse.json();
        console.log('Condition keys loaded:', conditionKeys);
        initializeUI(); // Call after
    } catch (error) {
        console.error('Error loading condition keys:', error);
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = 'Failed to load condition keys.  Application may not function correctly.';
        errorMessageElement.style.display = 'block';
         initializeUI(); // still initialize
    }
}

function createConditionInput(availableConditionTypes, loadedData = null) {
    const container = document.createElement('div');
    const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);

    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Condition Type:';
    const typeSelect = document.createElement('select');
    typeSelect.id = `conditionType-${uniqueId}`;
    typeSelect.className = 'condition-type';

    const defaultTypeOption = document.createElement('option');
    defaultTypeOption.value = '';
    defaultTypeOption.textContent = '-- Select Type --';
    typeSelect.appendChild(defaultTypeOption);

    for (const type in availableConditionTypes) {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = availableConditionTypes[type].label;
        typeSelect.appendChild(option);
    }
    container.appendChild(typeLabel);
    container.appendChild(typeSelect);

    const keyLabel = document.createElement('label');
    keyLabel.textContent = 'Condition Key:';
    const keySelect = document.createElement('select');
    keySelect.id = `conditionKey-${uniqueId}`;
    keySelect.className = 'condition-key';

    const defaultKeyOption = document.createElement('option');
    defaultKeyOption.value = '';
    defaultKeyOption.textContent = '-- Select Key --';
    keySelect.appendChild(defaultKeyOption);

    container.appendChild(keyLabel);
    container.appendChild(keySelect);

    const valueLabel = document.createElement('label');
    valueLabel.textContent = 'Value:';
    let valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.id = `conditionValue-${uniqueId}`;
    valueInput.className = 'condition-value';
    container.appendChild(valueLabel);
    container.appendChild(valueInput);

    typeSelect.addEventListener('change', () => {
        const selectedType = typeSelect.value;
        keySelect.innerHTML = '<option value="">-- Select Key --</option>';
        valueInput.value = '';

        if (selectedType && conditionTypes[selectedType]) {
            const keysForType = conditionKeys[conditionTypes[selectedType].key];
            if (keysForType) {
                for (const key of keysForType) {
                    const keyOption = document.createElement('option');
                    keyOption.value = key;
                    keyOption.textContent = key;
                    keySelect.appendChild(keyOption);
                }
            }
        }
    });

    keySelect.addEventListener('change', () => {
        const selectedType = typeSelect.value;
        const selectedKey = keySelect.value;

        if (selectedType) {
            const formatString = conditionTypes[selectedType].format;
            if (formatString.includes('value') || formatString.includes('count')) {
                valueInput.type = 'number';
            } else if (formatString.includes('true/false')) {
                const valueSelect = document.createElement('select');
                valueSelect.id = `conditionValue-${uniqueId}`;
                valueSelect.className = 'condition-value';
                const trueOption = document.createElement('option');
                trueOption.value = 'true';
                trueOption.textContent = 'True';
                const falseOption = document.createElement('option');
                falseOption.value = 'false';
                falseOption.textContent = 'False';
                valueSelect.appendChild(trueOption);
                valueSelect.appendChild(falseOption);
                valueInput.parentNode.replaceChild(valueSelect, valueInput);
                valueInput = valueSelect;
            } else {
                valueInput.type = 'text';
            }
        } else {
            valueInput.type = 'text';
        }
    });

    if (loadedData) {
        if (loadedData.type && conditionTypes[loadedData.type]) {
            typeSelect.value = loadedData.type;
            const typeEvent = new Event('change');
            typeSelect.dispatchEvent(typeEvent);

            if (loadedData.key) {
                keySelect.value = loadedData.key;
                const keyEvent = new Event('change');
                keySelect.dispatchEvent(keyEvent);

                setTimeout(() => {
                    const valueInput = document.getElementById(`conditionValue-${uniqueId}`);
                    if (valueInput) {
                        const formatString = conditionTypes[loadedData.type].format;
                        if (formatString.includes('true/false')) {
                            if (valueInput.tagName === 'SELECT') {
                                valueInput.value = loadedData.value.toString();
                            }
                        } else if (formatString.includes('value') || formatString.includes('count')) {
                            if (valueInput.type === 'number') {
                                valueInput.value = loadedData.value;
                            }
                        } else {
                            valueInput.value = loadedData.value;
                        }
                    }
                }, 0);
            }
        }
    }
    return container;
}

function initializeUI() {
    console.log('Conditions UI initialized');
}

// Load condition keys from JSON file when the script loads
loadConditionKeys();
