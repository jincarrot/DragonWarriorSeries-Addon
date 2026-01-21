import { world } from "@minecraft/server";
import { Warrior } from "../modules/warrior";
export class WarriorManager {
    constructor() {
        this.warriors = {};
        world.afterEvents.playerSpawn.subscribe((arg) => {
            if (!(arg.player.id in this.warriors)) {
                this.warriors[arg.player.id] = new Warrior(arg.player.id);
            }
        });
    }
    getWarrior(playerId) {
        if (!(playerId in this.warriors))
            this.warriors[playerId] = new Warrior(playerId);
        return this.warriors[playerId];
    }
}
export const warriorManager = new WarriorManager();
//# sourceMappingURL=warriorManager.js.map