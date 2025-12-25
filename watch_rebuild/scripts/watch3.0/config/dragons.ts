function defaultLevelRule(exp: number): number {
    return Math.floor(Math.sqrt(exp));
}

function defaultEnergyRule(exp: number): number {
    return Math.floor(Math.sqrt(exp)) * 20;
}

export let dragonData: Record<string, any> = {
    "dws:reguman": {
        maxLevel: 10,
        name: "雷古曼",
        rules: [defaultLevelRule, defaultEnergyRule],
        attributes: ["fire"],
        abilities: [],
    }
}
