import { abilityManager, AbilityManager } from "./abilityManager";
import { dragonManager, DragonManager } from "./dragonManager";
import { warriorManager, WarriorManager } from "./warriorManager";

class Manager{
    readonly warrior: WarriorManager;
    readonly ability: AbilityManager;
    readonly dragon: DragonManager;

    constructor() {
        this.warrior = warriorManager;
        this.ability = abilityManager;
        this.dragon = dragonManager;
    }
}

/**
 * Manages warriors and abilities.
 */
export const manager = new Manager();