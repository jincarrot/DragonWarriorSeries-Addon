export class Collision {
    constructor(dim) { this.dim = dim; }
    ;
}
export class Sphere extends Collision {
    constructor(origin, range, dim) {
        super(dim);
        this.origin = origin;
        this.range = range;
    }
    getEntities() {
        let entities = this.dim.getEntities({ location: { x: this.origin.x, y: this.origin.y, z: this.origin.z }, maxDistance: this.range });
        return entities;
    }
}
export class Box extends Collision {
    constructor(cornerA, cornerB, dim) {
        super(dim);
        this.cornerA = cornerA;
        this.cornerB = cornerB;
    }
    getEntities() {
        let volume = { x: this.cornerB.x - this.cornerA.x, y: this.cornerB.y - this.cornerA.y, z: this.cornerB.z - this.cornerA.z };
        let entities = this.dim.getEntities({ location: this.cornerA, volume: volume });
        return entities;
    }
}
export class Ray extends Collision {
    constructor(origin, direction, distance, dim) {
        super(dim);
        this.origin = origin;
        this.direction = direction;
        this.distance = distance;
    }
    getEntities() {
        let entityRayCasts = this.dim.getEntitiesFromRay(this.origin, this.direction, { "maxDistance": this.distance });
        let entities = [];
        for (let e of entityRayCasts) {
            entities.push(e.entity);
        }
        return entities;
    }
}
export class Segment extends Collision {
    constructor(fromLocation, toLocation, dim) {
        super(dim);
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
    }
    getEntities() {
        let dir = { x: this.toLocation.x - this.fromLocation.x, y: this.toLocation.y - this.fromLocation.y, z: this.toLocation.z - this.fromLocation.z };
        let dist = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
        let entityRayCasts = this.dim.getEntitiesFromRay(this.fromLocation, dir, { "maxDistance": dist });
        let entities = [];
        for (let e of entityRayCasts) {
            entities.push(e.entity);
        }
        return entities;
    }
}
export class Cylinder extends Collision {
    constructor(origin, range, height, dim) {
        super(dim);
        this.origin = origin;
        this.range = range;
        this.height = height;
    }
    getEntities() {
        let entities = this.dim.getEntities();
        entities.forEach((entity) => {
            let loc = entity.location;
            if (Math.sqrt(loc.x * loc.x + loc.z * loc.z) <= this.range && loc.y - this.origin.y < this.height) { }
            else
                entities.splice(entities.indexOf(entity), 1);
        });
        return entities;
    }
}
export class HollowSphere extends Sphere {
    constructor(origin, range, hollowRange, dim) {
        if (hollowRange >= range)
            throw RangeError(`Value of parameter "hollowRange" should less than parameter "range".\nReceived value:\n hollowRange: ${hollowRange}\n range: ${range}`);
        super(origin, range, dim);
        this.hollowRange = hollowRange;
    }
    getEntities() {
        let entities = this.dim.getEntities({ location: { x: this.origin.x, y: this.origin.y, z: this.origin.z }, maxDistance: this.range, minDistance: this.hollowRange });
        return entities;
    }
}
export class HollowCylinder extends Cylinder {
    constructor(origin, range, hollowRange, height, dim) {
        if (hollowRange >= range)
            throw RangeError(`Value of parameter "hollowRange" should less than parameter "range".\nReceived value:\n hollowRange: ${hollowRange}\n range: ${range}`);
        super(origin, range, height, dim);
        this.hollowRange = hollowRange;
    }
    getEntities() {
        let entities = this.dim.getEntities();
        entities.forEach((entity) => {
            let loc = entity.location;
            let dist = Math.sqrt(loc.x * loc.x + loc.z * loc.z);
            if (this.hollowRange < dist && dist <= this.range && loc.y - this.origin.y < this.height) { }
            else
                entities.splice(entities.indexOf(entity), 1);
        });
        return entities;
    }
}
//# sourceMappingURL=collisions.js.map