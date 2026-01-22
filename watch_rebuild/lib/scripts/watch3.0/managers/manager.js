import { abilityManager } from "./abilityManager";
import { dragonManager } from "./dragonManager";
import { warriorManager } from "./warriorManager";
class Manager {
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
//# sourceMappingURL=manager.js.map