export interface DragonExtraData {
    health: number;
    maxHealth: number;
    healthRegenerationRate: number;
    energyRegenerationRate: number;
    /**
     * Cool down to call out this dragon, in ticks.
     */
    callOutCoolDown: number;
}

export interface DragonSkillDefinition {
    enableAbility: boolean;
    enableEvolve: boolean;
    enableCombine: boolean;
}

export interface DragonAttr {
    entityId: string,
    ownerId: string,
    exp: number,
    energy: number,
    stage: number,
    /**
     * Extra data for this dragon.
     */
    extra: DragonExtraData,
    skills: DragonSkillDefinition
}

export interface DragonData extends DragonAttr {
    attributes: string[];
    abilities: number[];
    maxExp: number;
    /**
     * exp refresh rules
     * 
     * A list, index 0 is level and 1 is max energy
     */
    rules: ((exp: number) => number)[];
    name: string;
}
