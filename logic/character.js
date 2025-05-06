export class Character {
    constructor() {
        this.stats = {
            max_energy: 20,
            energy: 20,
            max_health: 20,
            health: 20,
            copper: 85,
            silver: 85,
            gold: 85,
            strength: 15,
            dexterity: 12,
            constitution: 12,
            intelligence: 12,
            charisma: 12,
            wisdom: 14,
            food: 10,
            drink: 10,
            reputation: 0  
        };

        // Initialize inventory. This can be an object where keys are item names and values are their quantities.
        this.inventory = {
            // Example: "potion": 2
        };
        this.skills = {
            // Example: "swordsmanship": 5
            "swordsmanship": 5,
            "archery": 3,
            "magic": 4
        };
    }

    // Get a stat value
    getStat(stat) {
        return this.stats[stat];
    }

    // Update a stat to a new value
    updateStat(stat, value) {
        if (this.stats.hasOwnProperty(stat)) {
            this.stats[stat] = value;
        }
    }

    // Modify a stat by an amount (positive or negative)
    modifyStat(stat, delta) {
        if (this.stats.hasOwnProperty(stat)) {
            this.stats[stat] += delta;
        }
    }

    // Add an item to the inventory
    addToInventory(item, quantity = 1) {
        if (this.inventory.hasOwnProperty(item)) {
            this.inventory[item] += quantity;
        } else {
            this.inventory[item] = quantity;
        }
    }

    // Remove an item from the inventory
    removeFromInventory(item, quantity = 1) {
        if (this.inventory.hasOwnProperty(item)) {
            this.inventory[item] -= quantity;
            if (this.inventory[item] <= 0) {
                delete this.inventory[item];
            }
        }
    }
    // Add an item to the skills
    addToSkill(skill, quantity = 1) {
        if (this.skills.hasOwnProperty(skill)) {
            this.skills[skill] += quantity;
        } else {
            this.skills[skill] = quantity;
        }
    }

    // Remove an item from the skill
    removeFromSkill(skill, quantity = 1) {
        if (this.skills.hasOwnProperty(skill)) {
            this.skills[skill] -= quantity;
            if (this.skills[skill] <= 0) {
                delete this.skills[skill];
            }
        }
    }
}