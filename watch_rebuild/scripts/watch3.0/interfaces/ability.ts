import { AbilityType } from "../enums/ability";
import { ElementType } from "../enums/attr";

/**
 * Defines behaviors of an ability.
 */
export interface AbilityCallbacks {
    /**
     * Main function of this ability, executes every 2 ticks if this ability is running.
     */
    main: Function;
    /**
     * Execute when this ability start run.
     */
    start?: Function;
    /**
     * Execute when this ability stopped abnormally.
     */
    stop?: Function;
    /**
     * Execute when this ability resume.
     */
    resume?: Function;
    /**
     * Execute when this ability paused.
     */
    pause?: Function;
    /**
     * Execute when this ability run completely.
     */
    finish?: Function;
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
    projectileAttr: ProjectileAttr;
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
    main?: Function;
    /**
     * Execute when an entity enter this area.
     */
    enter?: Function;
    /**
     * Execute when an entity leave this area.
     */
    leave?: Function;
    /**
     * Execute when this area created.
     */
    create?: Function;
    /**
     * Execute when this area destoried.
     */
    destory?: Function;
}

/**
 * Defines attributes of a projectile.
 */
export interface ProjectileAttr {
    attributes?: ElementType[];
    speed: number;
}

/**
 * Defines bahaviors of a projectile.
 */
export interface ProjectileCallbacks{
    /**
     * Main function of this projectile, executes every 2 ticks if this projectile is valid.
     */
    main?: Function;
    /**
     * Execute when this projectile spawn.
     */
    spawn?: Function;
    /**
     * Execute when this projectile despawn.
     */
    despawn?: Function;
}