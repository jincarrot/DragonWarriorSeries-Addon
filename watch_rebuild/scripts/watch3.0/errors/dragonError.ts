
export class DragonIdentifierError extends Error {
    constructor(identifier: string) {
        let message = `Type "${identifier}" is not a dragon.`
        super(message);
        this.name = "DragonIdentfierError";
    }
}
export class DragonInValidError extends Error {
    constructor(identifier: string) {
        let message = `EntityId "${identifier}" is not valid in the world.`
        super(message);
        this.name = "DragonInVaildError";
    }
}

export class DragonCallOutCoolDownError extends Error {
    constructor(identifier: string) {
        let message = `Dragon "${identifier}" cannot release now.`
        super(message);
        this.name = "DragonCallOutCoolDownError";
    }
}