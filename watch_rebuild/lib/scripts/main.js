import { world } from "@minecraft/server";
import { Dragon } from "./watch3.0/modules/dragon";
let aEvents = world.afterEvents;
aEvents.entityHitEntity.subscribe((arg) => {
    world.sendMessage(arg.damagingEntity.typeId);
    let temp = new Dragon(arg.damagingEntity.id, "dws:reguman");
});
//# sourceMappingURL=main.js.map