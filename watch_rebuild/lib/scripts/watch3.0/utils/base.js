import { world } from "@minecraft/server";
import { tryGetElements } from "./game";
import { ElementInteractions } from "../config/elements";
//Elements interaction.
world.afterEvents.entityHurt.subscribe((arg) => {
    let damagingEntity = arg.damageSource.damagingEntity;
    if (!damagingEntity)
        return;
    let attacker = damagingEntity;
    let attackerEls = tryGetElements(attacker);
    if (!attackerEls)
        return;
    let hurt = arg.hurtEntity;
    let hurtEls = tryGetElements(hurt);
    if (!hurtEls)
        return;
    let effect = 0;
    for (let attackerEl of attackerEls) {
        let increase = ElementInteractions[attackerEl]['increase'];
        let decrease = ElementInteractions[attackerEl]['decrease'];
        for (let hurtEl of hurtEls) {
            if (increase.indexOf(hurtEl) >= 0)
                effect++;
            if (decrease.indexOf(hurtEl) >= 0)
                effect--;
        }
    }
    for (let t = 0; t < effect; t++) {
        let health = hurt.getComponent("minecraft:health");
        if (hurt.isValid && health)
            health.setCurrentValue(Math.max(0, health.currentValue - arg.damage / (t + 1)));
    }
    for (let t = 0; t < -effect; t++) {
        let health = hurt.getComponent("minecraft:health");
        if (hurt.isValid && health)
            health.setCurrentValue(Math.min(health.effectiveMax, health.currentValue + arg.damage / (t + 2)));
    }
});
//# sourceMappingURL=base.js.map