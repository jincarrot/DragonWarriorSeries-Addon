import { Entity, EntityFilter, EntityQueryOptions, EntityTypeFamilyComponent, Player, Vector3, world } from "@minecraft/server";
import { dragonData } from "../config/dragons";
import { ABILITIES } from "../config/abilities";
import { alert } from "./debug";
import { ElementType } from "../enums/attr";

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
    if (entity.getComponent("minecraft:type_family")?.hasTypeFamily("monster")){
        filter.families?.push("player");
        filter.families?.push("dragon");
    }
    else{
        filter.families?.push("monster");
    }
    let targetEntities = entity.dimension.getEntities(filter);
    return targetEntities ? targetEntities[0] : undefined;
}

export function dist(a: Vector3, b: Vector3) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
}

export function isDragon(typeId: string) {
    return typeId in dragonData;
}

export function isAbility(abilityId: number) {
    return abilityId in ABILITIES;
}

export function isElement(typeId: string) {
    return typeId in Object.values(ElementType);
}

export function sendInfo(playerId: string, info: string) {
    (world.getEntity(playerId) as Player).sendMessage(info);
}

export function tryGetElements(entity: Entity) {
    let els: ElementType[] = [];
    if (entity.getComponent("minecraft:type_family")){
        for (let familyType of entity.getComponent("minecraft:type_family")?.getTypeFamilies() as string[]) {
            if (isElement(familyType)) els.push(familyType as ElementType);
        }
    }
    if (!els) els = JSON.parse(entity.getDynamicProperty("elements") as string || "[]");
    return els;
}