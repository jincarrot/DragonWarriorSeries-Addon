import { Entity, Vector3 } from "@minecraft/server";
import { AbilityType } from "../enums/ability";
import { ElementType } from "../enums/attr";
import { Ability } from "../modules/ability";
import { DetectionBox } from "../modules/detection";
import { Projectile } from "../modules/projectile";

/**
 * Defines behaviors of an ability.
 */
export interface AbilityCallbacks {
    /**
     * Main function of this ability, executes every 2 ticks if this ability is running.
     */
    main?: (arg: Ability) => void;
    /**
     * Execute when this ability start run.
     */
    start?: (arg: Ability) => void;
    /**
     * Execute when this ability stopped abnormally.
     */
    stop?: (arg: Ability) => void;
    /**
     * Execute when this ability resume.
     */
    resume?: (arg: Ability) => void;
    /**
     * Execute when this ability paused.
     */
    pause?: (arg: Ability) => void;
    /**
     * Execute when this ability run completely.
     */
    finish?: (arg: Ability) => void;
    /**
     * Callbacks of projectiles which spawns from this ability.
     */
    projectileCallbacks?: ProjectileCallbacks;
    /**
     * Callbacks of areas which creates from this ability.
     */
    detectingCallbacks?: DetectionCallbacks;
}

/**
 * Contains a set of attributes of an ability.
 */
export interface AbilityAttr {
    /**
     * Attributes of this ability (such as "gold", "light").
     */
    attributes: ElementType[];
    /**
     * Types of this ability (such as "range", "single").
     */
    types: AbilityType[];
    /**
     * Energy cost of this ability.
     */
    cost: number;
    /**
     * Name of this ability, in Chinese.
     */
    name: string;
    /**
     * Duration of this ability, in ticks.
     */
    duration: number
}

/**
 * Defines an ability.
 */
export interface AbilityDefinition extends AbilityAttr {
    projectileAttr?: ProjectileAttr;
    callbacks: AbilityCallbacks;
}

/**
 * Defines attributes of an area.
 */
export interface DetectionAttr {
    attributes: ElementType[];
}

/**
 * Defines behaviors of an area.
 */
export interface DetectionCallbacks{
    /**
     * Main function of this area, executes every 2 ticks if its ability is running.
     */
    main?: (arg: DetectionBox) => void;
    /**
     * Execute when an entity enter this area.
     */
    enter?: (arg0: DetectionBox, arg1: Entity) => void;
    /**
     * Execute when an entity leave this area.
     */
    leave?: (arg0: DetectionBox, arg1: Entity) => void;
    /**
     * Execute when this area created.
     */
    create?: (arg: DetectionBox) => void;
    /**
     * Execute when this area destoried.
     */
    destory?: (arg: DetectionBox) => void;
}

/**
 * Defines attributes of a projectile.
 */
export interface ProjectileAttr {
    attributes?: ElementType[];
    speed: number;
    range?: number;
}

/**
 * Defines bahaviors of a projectile.
 */
export interface ProjectileCallbacks{
    /**
     * Main function of this projectile, executes every 2 ticks if this projectile is valid.
     */
    main?: (arg: Projectile) => void;
    /**
     * Execute when this projectile spawn.
     */
    spawn?: (arg: Projectile) => void;
    /**
     * Execute when this projectile despawn.
     */
    despawn?: (arg: Projectile) => void;
    /**
     * Execute when this projectile hit enermy.
     */
    hitEntity?: (arg0: Projectile, arg1: Entity) => void;
    /**
     * Execute when this projectile hit block.
     */
    hitBlock?: (arg0: Projectile, arg1: Vector3) => void;
}