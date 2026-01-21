export class DragonExistError extends Error {
    constructor(playerName, entityType) {
        let message = `Player "${playerName}" already has a dragon "${entityType}".`;
        super(message);
        this.name = "DragonExistError";
    }
}
//# sourceMappingURL=warriorError.js.map