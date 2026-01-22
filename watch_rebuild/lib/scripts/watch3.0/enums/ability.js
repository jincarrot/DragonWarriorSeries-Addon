/**
 * Defines types of abilities.
 */
export var AbilityType;
(function (AbilityType) {
    /**
     * Ability that will attack others.
     */
    AbilityType["Offensive"] = "offensive";
    /**
     * Ability that will protect its user.
     */
    AbilityType["Defensive"] = "defensive";
    /**
     * Ability that will heal its user.
     */
    AbilityType["Therapeutic"] = "therapeutic";
})(AbilityType || (AbilityType = {}));
export var TraceModeType;
(function (TraceModeType) {
    TraceModeType["Trace"] = "trace";
    TraceModeType["Simple"] = "simple";
})(TraceModeType || (TraceModeType = {}));
export var AbilityStateType;
(function (AbilityStateType) {
    AbilityStateType["Running"] = "running";
    AbilityStateType["Pause"] = "pause";
    AbilityStateType["Finished"] = "finished";
    AbilityStateType["Stopped"] = "stopped";
})(AbilityStateType || (AbilityStateType = {}));
export var AbilityUseConditionType;
(function (AbilityUseConditionType) {
    AbilityUseConditionType[AbilityUseConditionType["NeedEnermy"] = 1] = "NeedEnermy";
    AbilityUseConditionType[AbilityUseConditionType["NeedEnergy"] = 2] = "NeedEnergy";
})(AbilityUseConditionType || (AbilityUseConditionType = {}));
//# sourceMappingURL=ability.js.map