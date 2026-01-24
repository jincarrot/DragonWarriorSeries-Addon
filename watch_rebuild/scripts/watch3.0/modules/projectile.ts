import { Entity, Vector3, world } from "@minecraft/server";
import { ElementType } from "../enums/attr";
import { ProjectileAttr, ProjectileCallbacks } from "../interfaces/ability";
import { dist, getClosestEnermy } from "../utils/game";

/**
 * Base class of projectiles.
 */
export abstract class Projectile {
    private static _id = 0;
    readonly id: number;
    base: Entity;
    attr: ProjectileAttr;
    callbacks: ProjectileCallbacks;

    constructor(entity: Entity, attr: ProjectileAttr, callbacks?: ProjectileCallbacks) {
        this.base = entity;
        this.attr = attr;
        this.callbacks = callbacks || {};
        this.id = Projectile._id++;
        if (!attr.range) attr.range = 1;
        if (!attr.attributes) attr.attributes = [];
        this.base.setDynamicProperty("elements", JSON.stringify(this.attr.attributes));
    }

    abstract main(): void;

    destory() {
        this.callbacks.despawn ? this.callbacks.despawn(this) : null;
        this.base && this.base.isValid ? this.base.remove() : null;
    }

    detect() {
        if (!this.base || !this.base.isValid) return;
        let enermy = getClosestEnermy(this.base);
        if (!enermy) return;
        if (dist(enermy.location, this.base.location) <= (this.attr.range as number)){
            if (this.callbacks.hitEntity) this.callbacks.hitEntity(this, enermy);
            this.destory()
            return;
        }
        let b = this.base.dimension.getBlock(this.base.location);
        if (b && !b.isAir) {
            if (this.callbacks.hitBlock) this.callbacks.hitBlock(this, b.location);
            this.destory()
        }
    }
}

/**
 * Defines a projectile that will move in a specified direction.
 */
export class SimpleProjectile extends Projectile {
    direction: Vector3;

    constructor(entity: Entity, attr: ProjectileAttr, direction?: Vector3, callbacks?: ProjectileCallbacks) {
        super(entity, attr, callbacks);
        let target = getClosestEnermy(entity) as Entity;
        if (!direction) {
            let targetLoc = target.location;
            let ori = entity.location;
            direction = {x: targetLoc.x - ori.x, y: targetLoc.y - ori.y, z: targetLoc.z - ori.z};
        }
        let dist = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
        direction = {x: direction.x / dist, y: direction.y / dist, z: direction.z / dist};
        this.direction = direction;
        this.callbacks.spawn ? this.callbacks.spawn(this) : null;
    }

    main() {
        let dir = {
            x: this.direction.x * this.attr.speed, 
            y: this.direction.y * this.attr.speed, 
            z: this.direction.z * this.attr.speed
        }
        this.base.applyImpulse(dir);
        if (this.callbacks.main) this.callbacks.main(this)
        this.detect()
    }
}

export class TraceProjectile extends Projectile {
    target: Entity;

    constructor(entity: Entity, attr: ProjectileAttr, target?: Entity, callbacks?: ProjectileCallbacks) {
        super(entity, attr, callbacks);
        if (!target) target = getClosestEnermy(entity) as Entity;        
        this.target = target;
        this.callbacks.spawn ? this.callbacks.spawn(this) : null;
    }

    main() {
        if (!this.target || !this.base || !this.target.isValid || !this.base.isValid) return;
        let tarLoc = this.target.location;
        let ori = this.base.location;
        let dir = {x: tarLoc.x - ori.x, y: tarLoc.y - ori.y, z: tarLoc.z - ori.z};
        let dist = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
        if (!dist) this.destory()
        dir = {x: dir.x / dist, y: dir.y / dist, z: dir.z / dist};
        dir = {
            x: dir.x * this.attr.speed, 
            y: dir.y * this.attr.speed, 
            z: dir.z * this.attr.speed
        }
        this.base.applyImpulse(dir);
        if (this.callbacks.main) this.callbacks.main(this)
        this.detect()
    }
}