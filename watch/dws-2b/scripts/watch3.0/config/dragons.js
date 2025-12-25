"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dragonData = void 0;
function defaultLevelRule(exp) {
    return Math.floor(Math.sqrt(exp));
}
function defaultEnergyRule(exp) {
    return Math.floor(Math.sqrt(exp)) * 20;
}
exports.dragonData = {
    "dws:reguman": {
        maxLevel: 10,
        name: "雷古曼",
        rules: [defaultLevelRule, defaultEnergyRule],
        attributes: ["fire"],
        abilities: [],
    }
};
