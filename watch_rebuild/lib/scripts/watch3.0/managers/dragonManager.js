import { world } from "@minecraft/server";
import { warriorManager } from "./warriorManager";
export class DragonManager {
    constructor() {
        world.afterEvents.entityDie.subscribe((arg) => {
            let entityId = arg.deadEntity.id;
            let typeId = arg.deadEntity.typeId;
            warriorManager.getAllWarriors().forEach((warrior) => {
                var _a;
                if (((_a = warrior.getDragon(typeId)) === null || _a === void 0 ? void 0 : _a.entityId) == entityId) {
                    let deadDragon = warrior.getDragon(typeId);
                    deadDragon.callOutCoolDown = 6000;
                    return;
                }
            });
        });
    }
}
export const dragonManager = new DragonManager();
//# sourceMappingURL=dragonManager.js.map