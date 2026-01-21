
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
    Therapeutic = "therapeutic"
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