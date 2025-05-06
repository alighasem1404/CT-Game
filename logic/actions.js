import { character } from './mainCharacter.js';

export class ActionSystem {
  static async executeAction(location, primary, secondary, variation) {
    const action = this.findAction(location, primary, secondary, variation);
    if (!action) return false;

    // Check conditions
    if (!this.checkConditions(action.conditions)) return false;

    // Apply results
    const results = this.getResults(action, secondary, variation);
    if (!results) return false;

    // Apply stat changes
    if (results.stat_changes) {
      Object.entries(results.stat_changes).forEach(([stat, value]) => {
        character.stats[stat] = (character.stats[stat] || 0) + value;
      });
    }

    // Apply item changes
    if (results.item_changes) {
      results.item_changes.forEach(({item, count}) => {
        character.inventory[item] = (character.inventory[item] || 0) + count;
      });
    }

    // Apply flag changes
    if (results.flag_changes) {
      results.flag_changes.forEach(({flag, value}) => {
        character.flags[flag] = value;
      });
    }

    // Deduct EP
    character.ep -= results.ep_cost;

    return {
      success: true,
      message: results.message
    };
  }

  static findAction(location, primary, secondary, variation) {
    const locationActions = window.gameData.actions.locations[location]?.actions || [];
    const action = locationActions.find(a => a.primary === primary);
    if (!action) return null;

    if (secondary) {
      const secAction = action.secondary.find(s => s.name === secondary);
      if (!secAction) return null;

      if (variation) {
        const varAction = secAction.variations.find(v => v.name === variation);
        return varAction || null;
      }
      return secAction;
    }
    return action;
  }

  static checkConditions(conditions) {
    if (!conditions || conditions.length === 0) return true;

    let result = true;
    let currentRelation = 'and';

    for (const condition of conditions) {
      const conditionResult = this.checkSingleCondition(condition);
      
      if (currentRelation === 'and') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }

      if (condition.relation) {
        currentRelation = condition.relation;
      }
    }

    return result;
  }

  static checkSingleCondition(condition) {
    const [type, value] = Object.entries(condition)[0];
    
    switch(type) {
      case 'stat_min':
        return Object.entries(value).every(([stat, min]) => 
          (character.stats[stat] || 0) >= min
        );
      case 'stat_max':
        return Object.entries(value).every(([stat, max]) => 
          (character.stats[stat] || 0) <= max
        );
      case 'has_item':
        return character.inventory[value] > 0;
      case 'missing_item':
        return !character.inventory[value] || character.inventory[value] <= 0;
      case 'equipped_item':
        return character.equipment[value] === true;
      case 'has_companion':
        return character.companions.includes(value);
      case 'has_status':
        return character.statuses.includes(value);
      case 'is_class':
        return character.class === value;
      case 'is_race':
        return character.race === value;
      case 'quest_completed':
        return character.completedQuests.includes(value);
      case 'quest_started':
        return character.activeQuests.includes(value);
      case 'event_triggered':
        return character.triggeredEvents.includes(value);
      case 'time_of_day':
        return window.gameState.timeOfDay === value;
      case 'is_weather':
        return window.gameState.weather === value;
      case 'is_area_visited':
        return character.visitedAreas.includes(value);
      case 'faction_standing':
        return Object.entries(value).every(([faction, standing]) => 
          (character.factionStanding[faction] || 0) >= standing
        );
      default:
        return false;
    }
  }

  static getResults(action, secondary, variation) {
    if (variation) {
      const secAction = action.secondary.find(s => s.name === secondary);
      if (!secAction) return null;
      const varAction = secAction.variations.find(v => v.name === variation);
      return varAction?.results || null;
    }
    if (secondary) {
      const secAction = action.secondary.find(s => s.name === secondary);
      return secAction?.results || null;
    }
    return action.results || null;
  }
} 