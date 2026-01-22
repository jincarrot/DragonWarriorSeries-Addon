
/**
 * Defines types of abilities.
 */
export enum AbilityType {
    /**
     * Ability that will attack others.
     */
    Offensive = "offensive",
    /**
     * Ability that will protect its user.
     */
    Defensive = "defensive",
    /**
     * Ability that will heal its user.
     */
    Therapeutic = "therapeutic",
    /**
     * Ability that will give debuffs to enermy.
     */
    Debuff = "debuff"
}

export enum TraceModeType {
    Trace = "trace",
    Simple = "simple"
}

export enum AbilityStateType {
    Running = "running",
    Pause = "pause",
    Finished = "finished",
    Stopped = "stopped"
}

export enum AbilityUseConditionType {
    NeedEnermy = 1,
    NeedEnergy = 2,
}