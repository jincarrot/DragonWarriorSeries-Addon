import { Entity, EntityFilter, EntityQueryOptions, EntityTypeFamilyComponent, Vector3 } from "@minecraft/server";
import { dragonData } from "../config/dragons";

/**
 * Get the closest enermy of a specific entity.
 * @param entity 
 */
export function getClosestEnermy(entity: Entity) {
    let filter: EntityQueryOptions = {
        families: [],
        location: entity.location,
        closest: 1
    }
    if ((entity.getComponent("minecraft:type_family") as EntityTypeFamilyComponent).hasTypeFamily("monster")){
        filter.families?.push("player");
        filter.families?.push("dragon");
    }
    else{
        filter.families?.push("monster");
    }
    return entity.dimension.getEntities(filter)[0];
}

export function dist(a: Vector3, b: Vector3) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
}

export function isDragon(typeId: string) {
    return typeId in dragonData;
}