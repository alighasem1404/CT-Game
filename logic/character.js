export class Character {
    constructor() {
        this.stats = {
            max_energy: 20,
            energy: 20,
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
            reputation: 0  // added reputation stat with default value 0
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
}