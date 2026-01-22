import { world } from "@minecraft/server"
import { manager } from "./watch3.0/managers/manager";
import { isDragon } from "./watch3.0/utils/game";
import "./watch3.0/utils/base"

let aEvents = world.afterEvents;

aEvents.itemUse.subscribe((arg) => {
    if (arg.itemStack.typeId.indexOf("dws:") < 0) return;
    let warrior = manager.warrior.getWarrior(arg.source.id);

    // Show menu when use dragon watch.
    if (arg.itemStack.typeId == 'dws:dragon_watch') {
        warrior.watch.show();
    }

    // Dragon card.
    if (arg.itemStack.typeId.indexOf("_card") >= 0) {
        let dragonType = arg.itemStack.typeId.replace("_card", "");
        if (isDragon(dragonType)) {
            if (!warrior.hasDragon(dragonType)) {
                warrior.addDragonByType(dragonType);
                if (warrior.dragons.length == 1) {
                    warrior.base.runCommand("give @s dws:dragon_watch");
                }
            }
        }
    }

    if (arg.itemStack.typeId == "dws:exp") {
        warrior.showExpForm();
    }
})
