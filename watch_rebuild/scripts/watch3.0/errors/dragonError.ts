
export class DragonIdentifierError extends Error {
    constructor(identifier: string) {
        let message = `Type "${identifier}" is not a dragon.`
        super(message);
        this.name = "DragonIdentfierError";
    }
}