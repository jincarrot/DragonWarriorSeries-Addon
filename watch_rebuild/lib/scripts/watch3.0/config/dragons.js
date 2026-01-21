function defaultLevelRule(exp) {
    return Math.floor(Math.sqrt(exp / 10));
}
function defaultEnergyRule(exp) {
    return Math.floor(Math.sqrt(exp / 10)) * 20;
}
export let dragonData = {
    "dws:reguman": {
        maxExp: 1000,
        name: "雷古曼",
        rules: [defaultLevelRule, defaultEnergyRule],
        attributes: ["fire"],
        abilities: [],
    },
};
//# sourceMappingURL=dragons.js.map