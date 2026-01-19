import { Entity, EntityFilter, EntityQueryOptions, EntityTypeFamilyComponent } from "@minecraft/server";

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