function defaultLevelRule(exp) {
    return Math.floor(Math.sqrt(exp));
}
function defaultEnergyRule(exp) {
    return Math.floor(Math.sqrt(exp)) * 20;
}
export let dragonData = {
    "dws:reguman": {
        maxLevel: 10,
        name: "雷古曼",
        rules: [defaultLevelRule, defaultEnergyRule],
        attributes: ["fire"],
        abilities: [],
    }
};
//# sourceMappingURL=dragons.js.map