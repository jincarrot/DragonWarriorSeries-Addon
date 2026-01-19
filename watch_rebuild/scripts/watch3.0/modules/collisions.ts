import { Dimension, Entity, Vector3 } from "@minecraft/server";

export abstract class Collision {
    dim: Dimension;
    constructor(dim: Dimension) {this.dim = dim};
    abstract getEntities(): Entity[];
}

export class Sphere extends Collision{
    origin: Vector3;
    range: number;

    constructor(origin: Vector3, range: number, dim: Dimension) {
        super(dim);
        this.origin = origin;
        this.range = range;
    }

    getEntities(): Entity[] {
        let entities = this.dim.getEntities({location: {x: this.origin.x, y: this.origin.y, z: this.origin.z}, maxDistance: this.range});
        return entities;
    }
}

export class Box extends Collision {
    cornerA: Vector3;
    cornerB: Vector3;

    constructor(cornerA: Vector3, cornerB: Vector3, dim: Dimension) {
        super(dim);
        this.cornerA = cornerA;
        this.cornerB = cornerB;
    }

    getEntities(): Entity[] {
        let volume = {x: this.cornerB.x - this.cornerA.x, y: this.cornerB.y - this.cornerA.y, z: this.cornerB.z - this.cornerA.z};
        let entities = this.dim.getEntities({location: this.cornerA, volume: volume});
        return entities;
    }
}

export class Ray extends Collision {
    origin: Vector3;
    direction: Vector3;
    distance: number;

    constructor(origin: Vector3, direction: Vector3, distance: number, dim: Dimension){
        super(dim);
        this.origin = origin;
        this.direction = direction;
        this.distance = distance;
    }

    getEntities(): Entity[] {
        let entityRayCasts = this.dim.getEntitiesFromRay(this.origin, this.direction, {"maxDistance": this.distance});
        let entities = [];
        for (let e of entityRayCasts){
            entities.push(e.entity);
        }
        return entities;
    }
}

export class Segment extends Collision {
    fromLocation: Vector3;
    toLocation: Vector3;

    constructor(fromLocation: Vector3, toLocation: Vector3, dim: Dimension){
        super(dim);
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
    }

    getEntities(): Entity[] {
        let dir = {x: this.toLocation.x - this.fromLocation.x, y: this.toLocation.y - this.fromLocation.y, z: this.toLocation.z - this.fromLocation.z};
        let dist = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
        let entityRayCasts = this.dim.getEntitiesFromRay(this.fromLocation, dir, {"maxDistance": dist});
        let entities = [];
        for (let e of entityRayCasts){
            entities.push(e.entity);
        }
        return entities;
    }
}

export class Cylinder extends Collision {
    origin: Vector3;
    range: number;
    height: number;

    constructor(origin: Vector3, range: number, height: number, dim: Dimension) {
        super(dim);
        this.origin = origin;
        this.range = range;
        this.height = height;
    }

    getEntities(): Entity[] {
        let entities = this.dim.getEntities();
        entities.forEach((entity) => {
            let loc = entity.location;
            if (Math.sqrt(loc.x * loc.x + loc.z * loc.z) <= this.range && loc.y - this.origin.y < this.height) {}
            else entities.splice(entities.indexOf(entity), 1);
        });
        return entities;
    }
}

export class HollowSphere extends Sphere {
    hollowRange: number;

    constructor(origin: Vector3, range: number, hollowRange: number, dim: Dimension) {
        if (hollowRange >= range) throw RangeError(`Value of parameter "hollowRange" should less than parameter "range".\nReceived value:\n hollowRange: ${hollowRange}\n range: ${range}`);
        super(origin, range, dim);
        this.hollowRange = hollowRange;
    }

    getEntities(): Entity[] {
        let entities = this.dim.getEntities({location: {x: this.origin.x, y: this.origin.y, z: this.origin.z}, maxDistance: this.range, minDistance: this.hollowRange});
        return entities;
    }
}

export class HollowCylinder extends Cylinder {
    hollowRange: number;

    constructor(origin: Vector3, range: number, hollowRange: number, height: number, dim: Dimension) {
        if (hollowRange >= range) throw RangeError(`Value of parameter "hollowRange" should less than parameter "range".\nReceived value:\n hollowRange: ${hollowRange}\n range: ${range}`);
        super(origin, range, height, dim);
        this.hollowRange = hollowRange;
    }

    getEntities(): Entity[] {
        let entities = this.dim.getEntities();
        entities.forEach((entity) => {
            let loc = entity.location;
            let dist = Math.sqrt(loc.x * loc.x + loc.z * loc.z)
            if (this.hollowRange < dist && dist <= this.range && loc.y - this.origin.y < this.height) {}
            else entities.splice(entities.indexOf(entity), 1);
        });
        return entities;
    }
}