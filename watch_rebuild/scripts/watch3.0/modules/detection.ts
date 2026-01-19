import { DetectionAttr, DetectionCallbacks } from "../interfaces/ability";
import { Collision } from "./collisions";

/**
 * Defines an area to apply the effect of an ability.
 */
export class DetectionBox {
    collision: Collision;
    attr: DetectionAttr;
    callbacks: DetectionCallbacks;

    constructor(data: any) {
        this.attr = data.attr;
        this.collision = data;
        this.callbacks = {};
    }
}