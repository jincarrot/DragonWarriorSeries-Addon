import { world } from "@minecraft/server";
import { dragonData } from "../config/dragons";
import { ABILITIES } from "../config/abilities";
/**
 * Get the closest enermy of a specific entity.
 * @param entity
 */
export function getClosestEnermy(entity) {
    var _a, _b, _c, _d;
    let filter = {
        families: [],
        location: entity.location,
        closest: 1
    };
    if ((_a = entity.getComponent("minecraft:type_family")) === null || _a === void 0 ? void 0 : _a.hasTypeFamily("monster")) {
        (_b = filter.families) === null || _b === void 0 ? void 0 : _b.push("player");
        (_c = filter.families) === null || _c === void 0 ? void 0 : _c.push("dragon");
    }
    else {
        (_d = filter.families) === null || _d === void 0 ? void 0 : _d.push("monster");
    }
    let targetEntities = entity.dimension.getEntities(filter);
    return targetEntities ? targetEntities[0] : undefined;
}
export function dist(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
}
export function isDragon(typeId) {
    return typeId in dragonData;
}
export function isAbility(abilityId) {
    return abilityId in ABILITIES;
}
export function sendInfo(playerId, info) {
    world.getEntity(playerId).sendMessage(info);
}
//# sourceMappingURL=game.js.map