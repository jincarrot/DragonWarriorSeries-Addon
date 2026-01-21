import { Entity, system, Vector3 } from "@minecraft/server";
import { Projectile, SimpleProjectile, TraceProjectile } from "./projectile";
import { DetectionBox } from "./detection";
import { ABILITIES } from "../config/abilities";
import { AbilityAttr, AbilityCallbacks, ProjectileAttr } from "../interfaces/ability";
import { AbilityStateType, TraceModeType } from "../enums/ability";
import { AbilityIdentifierError, AbilityProgressError } from "../errors/abilityError";
import { Collision } from "./collisions";
import { LivingDragon } from "./dragon";

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
    user: LivingDragon;
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
    private detections: DetectionBox[];
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
    private runtimeId: number;
    /**
     * Ticks this ability ran.
     */
    private ticks: number;
    /**
     * State of this ability. Normal is 0, pause is 1 and stopped is 2.
     */
    private _state: AbilityStateType;

    get state() {
        return this._state;
    }

    constructor(user: LivingDragon, abilityId: number) {
        if (!(abilityId in ABILITIES)) throw new AbilityIdentifierError(abilityId);
        this.user = user;
        this.attr = ABILITIES[abilityId];
        this.projectileAttr = ABILITIES[abilityId].projectileAttr || {speed: 1};
        this.projectiles = [];
        this.detections = [];
        this.callbacks = ABILITIES[abilityId].callbacks;
        this.id = Ability._id++;
        this.ticks = 0;
        this._state = AbilityStateType.Running;
        if (this.callbacks.start) this.callbacks.start(this);
        this.runtimeId = system.runInterval(this.main, 2);
        if (!this.projectileAttr.attributes) this.projectileAttr.attributes = this.attr.attributes;
    }

    /**
     * Pause this ability. Use method "resume" to resume ability's running.
     */
    pause() {
        if (this._state != AbilityStateType.Running) throw new AbilityProgressError(this._state, AbilityStateType.Pause);
        this._state = AbilityStateType.Pause;
        system.clearRun(this.runtimeId)
        this.callbacks.pause ? this.callbacks.pause(this) : null;
    }

    /**
     * Resume this ability if it was paused.
     */
    resume() {
        if (this._state != AbilityStateType.Pause) throw new AbilityProgressError(this._state, AbilityStateType.Running);
        this._state = AbilityStateType.Running;
        this.runtimeId = system.runInterval(this.main, 2);
        this.callbacks.resume ? this.callbacks.resume(this) : null;
    }

    /**
     * Stop this ability. Cannot resume again.
     */
    stop() {
        this._state = AbilityStateType.Stopped;
        system.clearRun(this.runtimeId);
        this.callbacks.stop ? this.callbacks.stop(this) : null;
        this.clearAllProjectiles();
        this.clearAllDetections();
    }

    /**
     * Main process of this ability, runs every 2 ticks.
     */
    private main() {
        for (let projectile of this.projectiles) 
            if (!projectile.base || !projectile.base.isValid) this.projectiles.splice(this.projectiles.indexOf(projectile), 1);
        if (this._state == AbilityStateType.Running) {
            if (this.callbacks.main) this.callbacks.main(this);
            this.projectiles.forEach((projectile) => { projectile.main() });
            this.detections.forEach((detection) => { detection.main() });
            this.ticks += 2;
            if (this.ticks > this.attr.duration) {
                this._state = AbilityStateType.Finished;
                system.clearRun(this.runtimeId);
                if (this.callbacks.finish) this.callbacks.finish(this);
            }
        }
    }

    /**
     * Spawn a projectile in a location.
     * @param typeId The identifier of the projectile.
     * @param location The location where the projectile will spawn. 
     * If not specified, it will chose the location of the fist projectile which spawn previously, or the user's location.
     */
    spawnProjectile(typeId: string, location?: Vector3, traceMode = TraceModeType.Simple) {
        // Get default location.
        if (!location) location = this.projectiles ? this.projectiles[0].base.location : this.user.base.location;
        let entity = this.user.base.dimension.spawnEntity(typeId, location);
        let projectile = null;
        switch (traceMode) {
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
        return projectile;
    }

    /**
     * Get projectile with a specific id.
     * @param projectileId Id of the target projectile.
     */
    getProjectile(projectileId: number) {
        for (let projectile of this.projectiles) {
            if (projectile.id == projectileId) return projectile;
        }
    }

    /**
     * Returns true if the specified projectile exist, else false.
     * @param projectileId Id of the target projectile.
     */
    hasProjectile(projectileId: number) {
        return this.getProjectile(projectileId) ? true : false;
    }

    /**
     * Delete a specific projectile.
     * @param projectileId Id of the target projectile.
     */
    deleteProjectile(projectileId: number) {
        let projectile = this.getProjectile(projectileId);
        if (projectile) {
            projectile.destory();
            this.projectiles.splice(this.projectiles.indexOf(projectile), 1);
        }
    }

    /**
     * Clear all projectiles.
     */
    clearAllProjectiles() {
        for (let projectile of this.projectiles) 
            projectile.destory();
        this.projectiles = [];
    }

    /**
     * Create a detection.
     */
    createDetection(collision: Collision) {
        let detection = new DetectionBox(collision, this.callbacks.detectingCallbacks);
        this.detections.push(detection);
        return detection;
    }

    /**
     * Get detection with a specified id.
     * @param detectionId Id of the target detection.
     */
    getDetection(detectionId: number) {
        for (let detection of this.detections) {
            if (detection.id == detectionId) return detection;
        }
    }

    /**
     * Returns true if the specified detection exist, else false.
     * @param detectionId Id of the target detection.
     */
    hasDetection(detectionId: number) {
        return this.getDetection(detectionId) ? true : false;
    }

    /**
     * Delete a specified detection.
     * @param detectionId Id of the target detection.
     */
    deleteDetection(detectionId: number) {
        let detection = this.getDetection(detectionId);
        if (detection) {
            detection.destory()
            this.detections.splice(this.detections.indexOf(detection), 1);
        }
    }

    /**
     * Clear all detections.
     */
    clearAllDetections() {
        this.detections = [];
    }
}