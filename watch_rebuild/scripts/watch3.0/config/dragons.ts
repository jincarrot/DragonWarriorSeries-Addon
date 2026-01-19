function defaultLevelRule(exp: number): number {
  return Math.floor(Math.sqrt(exp / 10));
}

function defaultEnergyRule(exp: number): number {
  return Math.floor(Math.sqrt(exp / 10)) * 20;
}

export let dragonData: Record<string, any> = {
  "dws:reguman": {
    maxExp: 1000,
    name: "雷古曼",
    rules: [defaultLevelRule, defaultEnergyRule],
    attributes: ["fire"],
    abilities: [],
  },
};
