import { Entity, system, Vector3 } from "@minecraft/server";
import { Projectile, SimpleProjectile, TraceProjectile } from "./projectile";
import { DetectionBox } from "./detection";
import { ABILITIES } from "../config/abilities";
import { AbilityAttr, AbilityCallbacks, ProjectileAttr } from "../interfaces/ability";
import { TraceModeType } from "../enums/ability";

/**
 * Defines a collection of abilities.
 */
export class Ability {
    private static _id = 0;
    /**
     * runtime identifier of this ability.
     */
    readonly id: number;
    /**
     * User of this ability.
     */
    user: Entity;
    /**
     * Attributes of this ability.
     */
    readonly attr: AbilityAttr;
    /**
     * Projectiles that belong to this ability.
     */
    private projectiles: Projectile[];
    /**
     * Defines a set of areas, where will execute ability's function.
     */
    detections: DetectionBox[];
    /**
     * Behaviors of this ability.
     */
    callbacks: AbilityCallbacks;
    /**
     * Attrs of its projectiles.
     */
    readonly projectileAttr: ProjectileAttr;
    /**
     * Id of the timer.
     */
    readonly runtimeId: number;
    /**
     * Ticks this ability ran.
     */
    private ticks: number;
    /**
     * State of this ability. Normal is 0, pause is 1 and stopped is 2.
     */
    private _state: number;

    get state() {
        return this._state;
    }

    constructor(user: Entity, abilityId: number) {
        this.user = user;
        this.attr = ABILITIES[abilityId];
        this.projectileAttr = ABILITIES[abilityId].projectileAttr;
        this.projectiles = [];
        this.detections = [];
        this.callbacks = ABILITIES[abilityId].callbacks;
        this.id = Ability._id++;
        this.ticks = 0;
        this._state = 0;
        if (this.callbacks.start) this.callbacks.start(this);
        this.runtimeId = system.runInterval(() => {
            if (this._state == 1){
                this.callbacks.main(this);
                this.projectiles.forEach((projectile) => {if (projectile.callbacks.main) projectile.callbacks.main(projectile)});
                this.detections.forEach((detection) => {if (detection.callbacks.main) detection.callbacks.main(detection)});
                this.ticks+=2;
                if (this.ticks > this.attr.duration){
                    this._state = 2;
                    system.clearRun(this.runtimeId);
                    if (this.callbacks.stop) this.callbacks.stop(this);
                }
            }
        }, 2);
    }

    /**
     * Spawn a projectile in a location.
     * @param typeId The identifier of the projectile.
     * @param location The location where the projectile will spawn. 
     * If not specified, it will chose the location of the fist projectile which spawn previously, or the user's location.
     */
    spawnProjectile(typeId: string, location?: Vector3, traceMode=TraceModeType.Simple) {
        // Get default location.
        if (!location) location = this.projectiles ? this.projectiles[1].base.location : this.user.location;
        let entity = this.user.dimension.spawnEntity(typeId, location);
        let projectile = null;
        switch (traceMode){
            case TraceModeType.Trace:
                projectile = new TraceProjectile(entity, this.projectileAttr, undefined, this.callbacks.projectileCallbacks);
                break;
            case TraceModeType.Simple:
                projectile = new SimpleProjectile(entity, this.projectileAttr, undefined, this.callbacks.projectileCallbacks);
                break;
        }
        // Add tag to this projectile.
        entity.addTag(`projectile#${this.id}:${projectile.id}`);
        this.projectiles.push(projectile);
    }

    /**
     * Get projectile with a specific id.
     * @param projectileId Id of the target projectile.
     */
    getProjectile(projectileId: number) {
        for (let projectile of this.projectiles){
            if (projectile.id == projectileId) return projectile;
        }
    }

    /**
     * Returns true if the specified projectile exist, else false.
     * @param projectileId Id of the target projectile.
     */
    hasProjectile(projectileId:number) {
        return this.getProjectile(projectileId) ? true : false;
    }
}