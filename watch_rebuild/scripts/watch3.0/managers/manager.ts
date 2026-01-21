import { abilityManager, AbilityManager } from "./abilityManager";
import { warriorManager, WarriorManager } from "./warriorManager";

class Manager{
    readonly warrior: WarriorManager;
    readonly ability: AbilityManager;

    constructor() {
        this.warrior = warriorManager;
        this.ability = abilityManager;
    }
}

/**
 * Manages warriors and abilities.
 */
export const manager = new Manager();