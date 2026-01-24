import { system, world } from "@minecraft/server";
import { alert } from "../utils/debug";
import { warriorManager } from "./warriorManager";
import { Dragon } from "../modules/dragon";

export class DragonManager{

    constructor() {
        world.afterEvents.entityDie.subscribe((arg) => {
            let entityId = arg.deadEntity.id;
            let typeId = arg.deadEntity.typeId;
            system.runTimeout(() => {warriorManager.getAllWarriors().forEach((warrior) => {
                if (warrior.getDragon(typeId)?.entityId == entityId) {
                    let deadDragon = warrior.getDragon(typeId) as Dragon;
                    deadDragon.callOutCoolDown = 6000;
                    deadDragon.health = 1;
                    deadDragon.reduceExp(10);
                    return;
                }
            })}, 30)
        })
    }
}

export const dragonManager = new DragonManager();