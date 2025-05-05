export class ConditionSystem {
    static conditionTypes = {
        // Basic Conditions
        stat_min: { label: 'Stat Minimum', format: 'STAT:value' },
        stat_max: { label: 'Stat Maximum', format: 'STAT:value' },
        has_item: { label: 'Has Item', format: 'item_name' },
        missing_item: { label: 'Missing Item', format: 'item_name' },
        item_count: { label: 'Item Count', format: 'item:count' },
        equipped_item: { label: 'Equipped Item', format: 'item_name' },
        
        // Quest & Story
        quest_completed: { label: 'Quest Completed', format: 'quest_id' },
        quest_started: { label: 'Quest Started', format: 'quest_id' },
        event_triggered: { label: 'Event Triggered', format: 'event_id' },
        
        // Faction & NPCs
        faction_standing: { label: 'Faction Standing', format: 'faction:value' },
        has_companion: { label: 'Has Companion', format: 'companion_name' },
        
        // Time & World
        time_of_day: { label: 'Time of Day', format: 'day/night' },
        is_weather: { label: 'Weather', format: 'weather_type' },
        is_area_visited: { label: 'Area Visited', format: 'true/false' },
        
        // Player State
        has_status: { label: 'Has Status', format: 'status_name' },
        is_class: { label: 'Is Class', format: 'class_name' },
        is_race: { label: 'Is Race', format: 'race_name' }
    };

    static createConditionUI() {
        const container = document.createElement('div');
        container.className = 'condition-group';
        
        const row = this.createConditionRow();
        const relation = this.createRelationSelect();
        const addBtn = document.createElement('button');
        addBtn.className = 'add-condition-btn';
        addBtn.textContent = '➕ Add Condition';
        
        container.appendChild(row);
        container.appendChild(relation);
        container.appendChild(addBtn);
        
        this.setupConditionHandlers(container);
        return container;
    }

    static createConditionRow() {
        const row = document.createElement('div');
        row.className = 'condition-row';
        
        const select = document.createElement('select');
        select.className = 'condition-type';
        
        // Add condition groups
        const groups = {
            'Basic Conditions': ['stat_min', 'stat_max', 'has_item', 'missing_item', 'item_count', 'equipped_item'],
            'Quest & Story': ['quest_completed', 'quest_started', 'event_triggered'],
            'Faction & NPCs': ['faction_standing', 'has_companion'],
            'Time & World': ['time_of_day', 'is_weather', 'is_area_visited'],
            'Player State': ['has_status', 'is_class', 'is_race']
        };
        
        for (const [groupName, types] of Object.entries(groups)) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = groupName;
            
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = this.conditionTypes[type].label;
                optgroup.appendChild(option);
            });
            
            select.appendChild(optgroup);
        }
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'condition-value';
        input.placeholder = 'Value';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-condition';
        removeBtn.textContent = '❌';
        
        row.appendChild(select);
        row.appendChild(input);
        row.appendChild(removeBtn);
        
        return row;
    }

    static createRelationSelect() {
        const relation = document.createElement('div');
        relation.className = 'condition-relation';
        relation.innerHTML = `
            <select class="relation-type">
                <option value="and">AND</option>
                <option value="or">OR</option>
            </select>
        `;
        return relation;
    }

    static setupConditionHandlers(container) {
        container.querySelector('.add-condition-btn').addEventListener('click', () => {
            const row = this.createConditionRow();
            const relation = this.createRelationSelect();
            container.insertBefore(row, container.querySelector('.add-condition-btn'));
            container.insertBefore(relation, container.querySelector('.add-condition-btn'));
        });

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-condition')) {
                const row = e.target.closest('.condition-row');
                const relation = row.nextElementSibling;
                if (relation.classList.contains('condition-relation')) {
                    relation.remove();
                }
                row.remove();
            }
        });
    }

    static getConditionsFromContainer(container) {
        const conditions = [];
        const rows = container.querySelectorAll('.condition-row');
        const relations = container.querySelectorAll('.relation-type');
        
        rows.forEach((row, index) => {
            const type = row.querySelector('.condition-type').value;
            const value = row.querySelector('.condition-value').value;
            const relation = index < relations.length ? relations[index].value : 'and';
            
            let condition;
            switch(type) {
                case 'stat_min':
                case 'stat_max':
                    const [stat, val] = value.split(':');
                    condition = { [type]: { [stat]: parseInt(val) } };
                    break;
                case 'has_item':
                case 'missing_item':
                case 'equipped_item':
                case 'has_companion':
                case 'has_status':
                case 'is_class':
                case 'is_race':
                case 'quest_completed':
                case 'quest_started':
                case 'event_triggered':
                case 'time_of_day':
                case 'is_weather':
                    condition = { [type]: value };
                    break;
                case 'item_count':
                    const [item, count] = value.split(':');
                    condition = { item_count: { [item]: parseInt(count) } };
                    break;
                case 'faction_standing':
                    const [faction, standing] = value.split(':');
                    condition = { faction_standing: { [faction]: parseInt(standing) } };
                    break;
                case 'is_area_visited':
                    condition = { is_area_visited: value === 'true' };
                    break;
            }
            
            if (index > 0) {
                condition.relation = relation;
            }
            conditions.push(condition);
        });
        
        return conditions;
    }

    static checkCondition(condition, character) {
        const type = Object.keys(condition)[0];
        const value = condition[type];
        
        switch(type) {
            case 'stat_min':
                return Object.entries(value).every(([stat, min]) => 
                    character.getStat(stat) >= min
                );
            case 'stat_max':
                return Object.entries(value).every(([stat, max]) => 
                    character.getStat(stat) <= max
                );
            case 'has_item':
                return character.inventory[value] > 0;
            case 'missing_item':
                return !character.inventory[value] || character.inventory[value] <= 0;
            case 'item_count':
                return Object.entries(value).every(([item, count]) => 
                    character.inventory[item] >= count
                );
            case 'equipped_item':
                return character.equipment.includes(value);
            case 'quest_completed':
                return character.completedQuests.includes(value);
            case 'quest_started':
                return character.activeQuests.includes(value);
            case 'event_triggered':
                return character.triggeredEvents.includes(value);
            case 'faction_standing':
                return Object.entries(value).every(([faction, standing]) => 
                    character.factions[faction] >= standing
                );
            case 'has_companion':
                return character.companions.includes(value);
            case 'time_of_day':
                return character.currentTime === value;
            case 'is_weather':
                return character.currentWeather === value;
            case 'is_area_visited':
                return character.visitedAreas.includes(value);
            case 'has_status':
                return character.statuses.includes(value);
            case 'is_class':
                return character.class === value;
            case 'is_race':
                return character.race === value;
            default:
                return false;
        }
    }

    static checkConditions(conditions, character) {
        if (!conditions.length) return true;
        
        let result = this.checkCondition(conditions[0], character);
        
        for (let i = 1; i < conditions.length; i++) {
            const condition = conditions[i];
            const relation = condition.relation || 'and';
            const conditionResult = this.checkCondition(condition, character);
            
            if (relation === 'and') {
                result = result && conditionResult;
            } else {
                result = result || conditionResult;
            }
        }
        
        return result;
    }
}