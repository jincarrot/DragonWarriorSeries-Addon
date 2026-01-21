import { abilityManager } from "./abilityManager";
import { warriorManager } from "./warriorManager";
class Manager {
    constructor() {
        this.warrior = warriorManager;
        this.ability = abilityManager;
    }
}
/**
 * Manages warriors and abilities.
 */
export const manager = new Manager();
//# sourceMappingURL=manager.js.map