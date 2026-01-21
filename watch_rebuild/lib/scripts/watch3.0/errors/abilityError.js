export class AbilityProgressError extends Error {
    constructor(oldState, newState) {
        let message = `Cannot transform the state of ability from state "${oldState}" to "${newState}".`;
        super(message);
        this.name = "AbilityProgressError";
    }
}
export class AbilityIdentifierError extends Error {
    constructor(abilityId) {
        let message = `Cannot find ability id ${abilityId}.`;
        super(message);
        this.name = "AbilityIdentifierError";
    }
}
export class AbilityInValidError extends Error {
    constructor(abilityId, entityId) {
        let message = `Entity ${entityId} doesn't has ability ${abilityId}.`;
        super(message);
        this.name = "AbilityInValidError";
    }
}
//# sourceMappingURL=abilityError.js.map