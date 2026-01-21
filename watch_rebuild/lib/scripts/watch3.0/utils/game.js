import { dragonData } from "../config/dragons";
/**
 * Get the closest enermy of a specific entity.
 * @param entity
 */
export function getClosestEnermy(entity) {
    var _a, _b, _c;
    let filter = {
        families: [],
        location: entity.location,
        closest: 1
    };
    if (entity.getComponent("minecraft:type_family").hasTypeFamily("monster")) {
        (_a = filter.families) === null || _a === void 0 ? void 0 : _a.push("player");
        (_b = filter.families) === null || _b === void 0 ? void 0 : _b.push("dragon");
    }
    else {
        (_c = filter.families) === null || _c === void 0 ? void 0 : _c.push("monster");
    }
    return entity.dimension.getEntities(filter)[0];
}
export function dist(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
}
export function isDragon(typeId) {
    return typeId in dragonData;
}
//# sourceMappingURL=game.js.map