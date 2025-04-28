export class Character {
    constructor() {
        this.stats = {
            energy: 15,
            health: 20,
            copper: 85,
            silver: 85,
            gold: 85,
            strength: 15,
            dexterity: 12,
            constitution: 12,
            intelligence: 12,
            charisma: 18,
            wisdom: 14
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