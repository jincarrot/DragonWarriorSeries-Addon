import { Entity, Vector3, world } from "@minecraft/server";
import { ElementType } from "../enums/attr";
import { ProjectileAttr, ProjectileCallbacks } from "../interfaces/ability";
import { getClosestEnermy } from "../utils/game";

/**
 * Base class of projectiles.
 */
export abstract class Projectile {
    private static _id = 0;
    id: number;
    base: Entity;
    attr: ProjectileAttr;
    callbacks: ProjectileCallbacks;

    constructor(entity: Entity, attr: ProjectileAttr, callbacks?: ProjectileCallbacks) {
        this.base = entity;
        this.attr = attr;
        this.callbacks = callbacks || {};
        this.id = Projectile._id++;
    }
}

/**
 * Defines a projectile that will move in a specified direction.
 */
export class SimpleProjectile extends Projectile {
    direction: Vector3;

    constructor(entity: Entity, attr: ProjectileAttr, direction?: Vector3, callbacks?: ProjectileCallbacks) {
        super(entity, attr, callbacks);
        if (!direction) {
            let targetLoc = getClosestEnermy(entity).location;
            let ori = entity.location;
            direction = {x: targetLoc.x - ori.x, y: targetLoc.y - ori.y, z: targetLoc.z - ori.z};
        }
        let dist = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
        direction = {x: direction.x / dist, y: direction.y / dist, z: direction.z / dist};
        this.direction = direction;
    }
}

export class TraceProjectile extends Projectile {
    target: Entity;

    constructor(entity: Entity, attr: ProjectileAttr, target?: Entity, callbacks?: ProjectileCallbacks) {
        super(entity, attr, callbacks);
        if (!target) target = getClosestEnermy(entity);        
        this.target = target;
    }
}