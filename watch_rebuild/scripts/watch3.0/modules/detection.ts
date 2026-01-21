import { Entity } from "@minecraft/server";
import { DetectionCallbacks } from "../interfaces/ability";
import { Collision } from "./collisions";

/**
 * Defines an area to apply the effect of an ability.
 */
export class DetectionBox {
    private static _id = 0;
    collision: Collision;
    callbacks: DetectionCallbacks;
    readonly id: number;
    private _entites: Entity[];

    /**
     * Entities that in this area.
     */
    get entities() {
        return this._entites;
    }

    constructor(collision: Collision, callbacks?: DetectionCallbacks) {
        this.collision = collision;
        this.callbacks = callbacks || {};
        this.id = DetectionBox._id++;
        this._entites = []
        this.callbacks.create ? this.callbacks.create(this) : null;
    }

    main() {
        this.refreshEntities();
        this.callbacks.main ? this.callbacks.main(this) : null;
    }

    private refreshEntities() {
        let newEntites = this.collision.getEntities();
        let remove = this._entites.filter((entity) => !newEntites.includes(entity));
        let add = newEntites.filter((entity) => !this._entites.includes(entity));
        this._entites = newEntites;
        remove.forEach((entity) => {
            if (this.callbacks.leave) this.callbacks.leave(this, entity);
        })
        add.forEach((entity) => {
            if (this.callbacks.enter) this.callbacks.enter(this, entity);
        })
    }

    destory() {
        this.callbacks.destory ? this.callbacks.destory(this) : null;
    }
}