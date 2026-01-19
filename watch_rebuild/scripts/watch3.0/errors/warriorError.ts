
export class DragonExistError extends Error {
    constructor(playerName: string, entityType: string) {
        let message = `Player "${playerName}" already has a dragon "${entityType}".`
        super(message);
        this.name = "DragonExistError";
    }
}