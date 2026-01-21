export class DragonIdentifierError extends Error {
    constructor(identifier) {
        let message = `Type "${identifier}" is not a dragon.`;
        super(message);
        this.name = "DragonIdentfierError";
    }
}
export class DragonInValidError extends Error {
    constructor(identifier) {
        let message = `EntityId "${identifier}" is not valid in the world.`;
        super(message);
        this.name = "DragonInVaildError";
    }
}
//# sourceMappingURL=dragonError.js.map