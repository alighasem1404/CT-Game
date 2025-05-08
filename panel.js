import { ConditionSystem } from './conditions.js';
import { character } from './logic/mainCharacter.js';

const primaryOptions = ["Work","Rest","Socialise","Explore","Craft","Train"];
let gameData = { locations: {} }, currentLoc = '', editContext = null, fileHandle;

// Initialize UI elements
const saveFileBtn = document.getElementById('saveFile');
const locationSelect = document.getElementById('locationSelect');
const newPrimarySelect = document.getElementById('newPrimary');
const newSecondaryName = document.getElementById('newSecondaryName');
const newVariationName = document.getElementById('newVariationName');
const newBaseEP = document.getElementById('newBaseEP');
const newEventDeck = document.getElementById('newEventDeck');
const addEntryBtn = document.getElementById('addEntryBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const allActionsTable = document.getElementById('allActionsTable');
const formTitle = document.getElementById('formTitle');

// Initialize condition containers
const primaryConditions = document.getElementById('primaryConditions');
const secondaryConditions = document.getElementById('secondaryConditions');
const variationConditions = document.getElementById('variationConditions');

// Initialize result container
const resultGroup = document.getElementById('resultGroup');

// Initialize primary select
primaryOptions.forEach(opt => {
  const o = document.createElement('option'); 
  o.value = opt.toLowerCase(); 
  o.textContent = opt;
  newPrimarySelect.append(o);
});

window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load and sanitize map.json
    let mapText = await (await fetch('map.json')).text();
    mapText = mapText.replace(/,\s*([}\]])/g,'$1');
    const mapData = JSON.parse(mapText);
    
    // Load actions
    const actionsData = await (await fetch('actions.json')).json();
    
    // Initialize game data
    gameData.locations = {};
    
    // Add all locations from map.json
    const areas = mapData.map?.areas || {};
    Object.values(areas).forEach(area => {
      (area.locations || []).forEach(loc => {
        const locationId = loc.id;
        gameData.locations[locationId] = {
          name: locationId,
          actions: []
        };
      });
    });
    
    // Add actions from actions.json
    Object.entries(actionsData.locations || {}).forEach(([loc, locData]) => {
      if (gameData.locations[loc]) {
        gameData.locations[loc].actions = locData.actions || [];
      }
    });
    
    setup();
  } catch(e) { 
    console.error('Error loading JSON:', e);
    alert('Error loading JSON: ' + e); 
  }
});

function setup() {
  // Setup location select
  locationSelect.innerHTML = '';
  Object.keys(gameData.locations).forEach(key => {
    const o = document.createElement('option');
    o.value = key;
    o.textContent = key;
    locationSelect.append(o);
  });
  locationSelect.disabled = false;
  saveFileBtn.disabled = false;
  addEntryBtn.disabled = false;
  currentLoc = locationSelect.value;

  // Setup event listeners
  locationSelect.onchange = () => { 
    currentLoc = locationSelect.value; 
    loadLocationActions(currentLoc);
  };
  saveFileBtn.onclick = saveFile;
  addEntryBtn.onclick = onAddOrUpdate;
  cancelEditBtn.onclick = cancelEdit;

  // Initialize condition containers
  [primaryConditions, secondaryConditions, variationConditions].forEach(container => {
    container.innerHTML = '';
    container.appendChild(ConditionSystem.createConditionUI());
  });

  // Setup result handlers
  setupResultHandlers(resultGroup);

  // Load initial location actions
  loadLocationActions(currentLoc);
}

async function saveFile() {
  if (!fileHandle) {
    fileHandle = await window.showSaveFilePicker({ 
      suggestedName: 'actions.json', 
      types: [{ description: 'JSON', accept: {'application/json': ['.json']} }] 
    });
  }
  const w = await fileHandle.createWritable(); 
  await w.write(JSON.stringify(gameData, null, 2)); 
  await w.close(); 
  alert('Saved');
}

function onAddOrUpdate() {
  try {
    const pr = newPrimarySelect.value;
    const prConds = ConditionSystem.getConditionsFromContainer(primaryConditions);
    const secName = newSecondaryName.value;
    const secConds = ConditionSystem.getConditionsFromContainer(secondaryConditions);
    const vName = newVariationName.value;
    const vConds = vName ? ConditionSystem.getConditionsFromContainer(variationConditions) : [];
    const baseEP = parseInt(newBaseEP.value) || 0;
    const deck = newEventDeck.value;
    const results = getResultsFromContainer(resultGroup);

    if (editContext) {
      const {loc, actIdx, secName: oldSec, varIdx} = editContext;
      const action = gameData.locations[loc].actions[actIdx];
      action.primary = pr;
      action.conditions = prConds;
      action.base_ep_cost = baseEP;
      action.event_deck = deck;
      
      const sec = action.secondary.find(s => s.name === oldSec);
      sec.name = secName;
      sec.conditions = secConds;
      
      if (varIdx != null) {
        // Update variation
        sec.variations[varIdx] = {
          name: vName,
          conditions: vConds,
          results: results
        };
      } else if (vName) {
        // Add new variation
        sec.variations.push({
          name: vName,
          conditions: vConds,
          results: results
        });
      } else {
        // Update secondary action
        sec.results = results;
      }
    } else {
      const entry = {
        primary: pr,
        conditions: prConds,
        secondary: [{
          name: secName,
          conditions: secConds,
          variations: [],
          results: {}
        }],
        base_ep_cost: baseEP,
        event_deck: deck,
        results: {}
      };
      
      if (vName) {
        entry.secondary[0].variations.push({
          name: vName,
          conditions: vConds,
          results: results
        });
      } else {
        entry.secondary[0].results = results;
      }
      
      (gameData.locations[currentLoc].actions || (gameData.locations[currentLoc].actions = [])).push(entry);
    }
    cancelEdit();
    renderTable();
  } catch(e) {
    alert('Invalid input: ' + e);
  }
}

function cancelEdit() {
  editContext = null;
  formTitle.textContent = 'Add New Action Entry';
  addEntryBtn.textContent = '➕ Add Entry';
  cancelEditBtn.style.display = 'none';
  newPrimarySelect.value = primaryOptions[0].toLowerCase();
  
  // Clear all condition containers
  [primaryConditions, secondaryConditions, variationConditions].forEach(container => {
    container.innerHTML = '';
    container.appendChild(ConditionSystem.createConditionUI());
  });

  // Clear results
  resultGroup.innerHTML = '';
  setupResultHandlers(resultGroup);

  newSecondaryName.value = '';
  newVariationName.value = '';
  newBaseEP.value = '0';
  newEventDeck.value = '';
}

function renderTable() {
  allActionsTable.innerHTML = '';
  Object.entries(gameData.locations || {}).forEach(([loc, locData]) => {
    (locData.actions || []).forEach((act, ai) => {
      if (!act.secondary || act.secondary.length === 0) {
        // Add a row for primary action even if no secondary actions
        addRow(loc, ai, act, {name: '', conditions: [], results: {}}, {name: '', conditions: [], results: {}}, null);
      } else {
        act.secondary.forEach(sec => {
          if (sec.variations && sec.variations.length) {
            sec.variations.forEach((v, vi) => {
              // Ensure variation has results
              if (!v.results) v.results = {};
              addRow(loc, ai, act, sec, v, vi);
            });
          } else {
            // Ensure secondary has results
            if (!sec.results) sec.results = {};
            addRow(loc, ai, act, sec, {name: '', conditions: [], results: {}}, null);
          }
        });
      }
    });
  });
}

function formatResults(results) {
  if (!results) return '-';
  const parts = [];
  if (results.ep_cost) parts.push(`EP: ${results.ep_cost}`);
  if (results.stat_changes && Object.keys(results.stat_changes).length > 0) {
    parts.push(`Stats: ${Object.entries(results.stat_changes).map(([stat, val]) => `${stat}+${val}`).join(', ')}`);
  }
  if (results.item_changes && results.item_changes.length > 0) {
    parts.push(`Items: ${results.item_changes.map(ic => `${ic.item}${ic.count > 0 ? '+' : ''}${ic.count}`).join(', ')}`);
  }
  if (results.flag_changes && results.flag_changes.length > 0) {
    parts.push(`Flags: ${results.flag_changes.map(fc => `${fc.flag}=${fc.state}`).join(', ')}`);
  }
  if (results.message) parts.push(`Msg: ${results.message}`);
  return parts.join(' | ');
}

function addRow(loc, ai, act, sec, v, vi) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${loc}</td>
    <td>${act.primary}</td>
    <td>${formatConds(act.conditions || [])}</td>
    <td class="result-cell">${formatResults(act.results)}</td>
    <td>${sec.name}</td>
    <td>${formatConds(sec.conditions || [])}</td>
    <td>${v.name || '-'}</td>
    <td>${formatConds(v.conditions || [])}</td>
    <td class="result-cell">${formatResults(v.results)}</td>
    <td>${act.base_ep_cost || 0}</td>
    <td>${act.event_deck || ''}</td>
    <td>
      <button onclick="onEdit('${loc}',${ai},'${sec.name}',${vi})">✏️</button>
      <button onclick="removeEntry('${loc}',${ai},'${sec.name}',${vi})">🗑️</button>
    </td>`;
  allActionsTable.append(tr);
}

function onEdit(loc, ai, secName, vi) {
  editContext = {loc, actIdx: ai, secName, varIdx: vi};
  const action = gameData.locations[loc].actions[ai];
  
  // Set primary action values
  newPrimarySelect.value = action.primary;
  primaryConditions.innerHTML = '';
  primaryConditions.appendChild(ConditionSystem.createConditionUI(action.conditions || []));
  
  // Set secondary action values
  const sec = action.secondary.find(s => s.name === secName);
  newSecondaryName.value = sec.name;
  secondaryConditions.innerHTML = '';
  secondaryConditions.appendChild(ConditionSystem.createConditionUI(sec.conditions || []));
  
  // Set variation values if exists
  if (vi != null) {
    newVariationName.value = sec.variations[vi].name;
    variationConditions.innerHTML = '';
    variationConditions.appendChild(ConditionSystem.createConditionUI(sec.variations[vi].conditions || []));
    // Set results from variation
    resultGroup.innerHTML = '';
    setResultsInContainer(resultGroup, sec.variations[vi].results || {});
  } else {
    newVariationName.value = '';
    variationConditions.innerHTML = '';
    variationConditions.appendChild(ConditionSystem.createConditionUI());
    // Set results from secondary action
    resultGroup.innerHTML = '';
    setResultsInContainer(resultGroup, sec.results || {});
  }
  
  // Set other values
  newBaseEP.value = action.base_ep_cost;
  newEventDeck.value = action.event_deck;
  
  // Update UI
  formTitle.textContent = 'Edit Action Entry';
  addEntryBtn.textContent = '✅ Update Entry';
  cancelEditBtn.style.display = 'inline-block';
}

function removeEntry(loc, ai, secName, vi) {
  const action = gameData.locations[loc].actions[ai];
  const sec = action.secondary.find(s => s.name === secName);
  if (vi != null) {
    sec.variations.splice(vi, 1);
  } else {
    action.secondary = action.secondary.filter(s => s.name !== secName);
  }
  cancelEdit(); 
  renderTable();
}

function formatConds(arr) {
  return arr.map(c => {
    const entries = Object.entries(c);
    return entries.map(([k, v]) => {
      if (typeof v === 'object') {
        return Object.entries(v).map(([sk, sv]) => `${k} ${sk} ≥ ${sv}`).join(', ');
      }
      return `${k} ${v}`;
    }).join(', ');
  }).join('; ');
}

// Setup result handlers
function setupResultHandlers(container) {
  const addBtn = container.querySelector('.add-result-btn');
  if (!addBtn) return; // Safety check
  
  addBtn.addEventListener('click', () => {
    const newRow = document.createElement('div');
    newRow.className = 'result-row';
    newRow.innerHTML = `
      <select class="result-type">
        <optgroup label="Stat Changes">
          <option value="stat_change">Stat Change</option>
        </optgroup>
        <optgroup label="Item Changes">
          <option value="item_change">Item Change</option>
        </optgroup>
        <optgroup label="Flag Changes">
          <option value="flag_change">Flag Change</option>
        </optgroup>
        <optgroup label="Other">
          <option value="ep_cost">EP Cost</option>
          <option value="message">Message</option>
        </optgroup>
      </select>
      <input type="text" class="result-value" placeholder="Value">
      <button class="remove-result">❌</button>
    `;
    
    // Insert before the add button
    container.insertBefore(newRow, addBtn);
    setupResultRowHandlers(newRow);
  });
  
  // Setup existing result rows
  container.querySelectorAll('.result-row').forEach(setupResultRowHandlers);
}

// Setup result row handlers
function setupResultRowHandlers(row) {
  const removeBtn = row.querySelector('.remove-result');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => row.remove());
  }
}

// Get results from container
function getResultsFromContainer(container) {
  const results = {
    ep_cost: 0,
    stat_changes: {},
    item_changes: [],
    flag_changes: [],
    message: ''
  };
  
  const rows = container.querySelectorAll('.result-row');
  rows.forEach(row => {
    const type = row.querySelector('.result-type').value;
    const value = row.querySelector('.result-value').value;
    
    switch (type) {
      case 'stat_change':
        const [stat, amount] = value.split(':');
        results.stat_changes[stat] = parseInt(amount);
        break;
      case 'item_change':
        const [item, count] = value.split(':');
        results.item_changes.push({ item, count: parseInt(count) });
        break;
      case 'flag_change':
        const [flag, state] = value.split(':');
        results.flag_changes.push({ flag, state: state === 'true' });
        break;
      case 'ep_cost':
        results.ep_cost = parseInt(value);
        break;
      case 'message':
        results.message = value;
        break;
    }
  });
  
  return results;
}

// Set results in container
function setResultsInContainer(container, results) {
  container.innerHTML = '';
  
  // Add EP cost
  if (results.ep_cost) {
    const row = document.createElement('div');
    row.className = 'result-row';
    row.innerHTML = `
      <select class="result-type">
        <optgroup label="Other">
          <option value="ep_cost">EP Cost</option>
        </optgroup>
      </select>
      <input type="text" class="result-value" placeholder="Value">
      <button class="remove-result">❌</button>
    `;
    container.appendChild(row);
    setupResultRowHandlers(row);
    row.querySelector('.result-type').value = 'ep_cost';
    row.querySelector('.result-value').value = results.ep_cost;
  }
  
  // Add stat changes
  Object.entries(results.stat_changes).forEach(([stat, amount]) => {
    const row = document.createElement('div');
    row.className = 'result-row';
    row.innerHTML = `
      <select class="result-type">
        <optgroup label="Stat Changes">
          <option value="stat_change">Stat Change</option>
        </optgroup>
      </select>
      <input type="text" class="result-value" placeholder="Value">
      <button class="remove-result">❌</button>
    `;
    container.appendChild(row);
    setupResultRowHandlers(row);
    row.querySelector('.result-type').value = 'stat_change';
    row.querySelector('.result-value').value = `${stat}:${amount}`;
  });
  
  // Add item changes
  results.item_changes.forEach(({ item, count }) => {
    const row = document.createElement('div');
    row.className = 'result-row';
    row.innerHTML = `
      <select class="result-type">
        <optgroup label="Item Changes">
          <option value="item_change">Item Change</option>
        </optgroup>
      </select>
      <input type="text" class="result-value" placeholder="Value">
      <button class="remove-result">❌</button>
    `;
    container.appendChild(row);
    setupResultRowHandlers(row);
    row.querySelector('.result-type').value = 'item_change';
    row.querySelector('.result-value').value = `${item}:${count}`;
  });
  
  // Add flag changes
  results.flag_changes.forEach(({ flag, state }) => {
    const row = document.createElement('div');
    row.className = 'result-row';
    row.innerHTML = `
      <select class="result-type">
        <optgroup label="Flag Changes">
          <option value="flag_change">Flag Change</option>
        </optgroup>
      </select>
      <input type="text" class="result-value" placeholder="Value">
      <button class="remove-result">❌</button>
    `;
    container.appendChild(row);
    setupResultRowHandlers(row);
    row.querySelector('.result-type').value = 'flag_change';
    row.querySelector('.result-value').value = `${flag}:${state}`;
  });
  
  // Add message
  if (results.message) {
    const row = document.createElement('div');
    row.className = 'result-row';
    row.innerHTML = `
      <select class="result-type">
        <optgroup label="Other">
          <option value="message">Message</option>
        </optgroup>
      </select>
      <input type="text" class="result-value" placeholder="Value">
      <button class="remove-result">❌</button>
    `;
    container.appendChild(row);
    setupResultRowHandlers(row);
    row.querySelector('.result-type').value = 'message';
    row.querySelector('.result-value').value = results.message;
  }
  
  // Add add button
  const addBtn = document.createElement('button');
  addBtn.className = 'add-result-btn';
  addBtn.textContent = '➕ Add Result';
  container.appendChild(addBtn);
  setupResultHandlers(container);
}

// Make functions available globally
window.onEdit = onEdit;
window.removeEntry = removeEntry;

function loadLocationActions(location) {
  // Clear existing table
  const tbody = allActionsTable.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  // Get actions for the selected location
  const locationData = gameData.locations[location];
  if (!locationData || !locationData.actions || locationData.actions.length === 0) {
    return; // Empty table for locations with no actions
  }

  // Add rows for each action in the location
  locationData.actions.forEach((act, ai) => {
    if (!act.secondary || act.secondary.length === 0) {
      // Add a row for primary action even if no secondary actions
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${location}</td>
        <td>${act.primary}</td>
        <td>${formatConds(act.conditions || [])}</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>${act.base_ep_cost || 0}</td>
        <td>${act.event_deck || ''}</td>
        <td>
          <button onclick="onEdit('${location}',${ai},'',null)">✏️</button>
          <button onclick="removeEntry('${location}',${ai}','',null)">🗑️</button>
        </td>`;
      tbody.appendChild(tr);
    } else {
      act.secondary.forEach(sec => {
        if (sec.variations && sec.variations.length) {
          sec.variations.forEach((v, vi) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${location}</td>
              <td>${act.primary}</td>
              <td>${formatConds(act.conditions || [])}</td>
              <td>${sec.name}</td>
              <td>${formatConds(sec.conditions || [])}</td>
              <td>${v.name}</td>
              <td>${formatConds(v.conditions || [])}</td>
              <td class="result-cell">${formatResults(v.results)}</td>
              <td>${act.base_ep_cost || 0}</td>
              <td>${act.event_deck || ''}</td>
              <td>
                <button onclick="onEdit('${location}',${ai},'${sec.name}',${vi})">✏️</button>
                <button onclick="removeEntry('${location}',${ai}','${sec.name}',${vi})">🗑️</button>
              </td>`;
            tbody.appendChild(tr);
          });
        } else {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${location}</td>
            <td>${act.primary}</td>
            <td>${formatConds(act.conditions || [])}</td>
            <td>${sec.name}</td>
            <td>${formatConds(sec.conditions || [])}</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>${act.base_ep_cost || 0}</td>
            <td>${act.event_deck || ''}</td>
            <td>
              <button onclick="onEdit('${location}',${ai},'${sec.name}',null)">✏️</button>
              <button onclick="removeEntry('${location}',${ai}','${sec.name}',null)">🗑️</button>
            </td>`;
          tbody.appendChild(tr);
        }
      });
    }
  });
}