//type:normal(单独伤害),range(范围伤害),pierce(穿透伤害),defend(防御),line(光线)
export var abilities = [
    {
        "name": "响雷火球",
        "id": 0,
        "attribute": "fire",
        "particle": ["dws:spark"],
        "base": "dws:fire_ball",
        "value": 11,
        "type": "normal",
        "duration": 0,
        "speed": 1,
        "consume": 30,
        "range": 2,
        "autoClear": 150,
        "effect": {
            "name": ["fire"],
            "time": 5
        }
    },
    {
        "name": "炫光爆裂",
        "id": 1,
        "attribute": "gold",
        "particle": ["dws:spark"],
        "base": "dws:gold_ball",
        "value": 11,
        "type": "normal",
        "duration": 0,
        "speed": 1,
        "consume": 30,
        "range": 2,
        "autoClear": 150,
        "effect": {
            "name": ["weakness"],
            "time": 5
        }
    },
    {
        "name": "冽海飓风",
        "id": 2,
        "attribute": "water",
        "particle": ["dws:water_storm"],
        "base": "dws:point",
        "value": 10,
        "type": "normal",
        "duration": 2,
        "speed": 1,
        "consume": 30,
        "range": 3,
        "autoClear": 150,
        "effect": {
            "name": ["slowness"],
            "time": 5
        }
    },
    {
        "name": "遮天幻雾",
        "id": 3,
        "attribute": "earth",
        "particle": ["dws:sand_particle"],
        "base": "dws:sand",
        "value": 5,
        "type": "range",
        "duration": 0,
        "speed": 0,
        "consume": 30,
        "range": 16,
        "autoClear": 250,
        "effect": {
            "name": ["weakness", "slowness"],
            "time": 15
        }
    },
    {
        "name": "千里追月",
        "id": 4,
        "attribute": "light",
        "particle": ["dws:spark"],
        "base": "dws:moon",
        "value": 11,
        "type": "normal",
        "duration": 0,
        "speed": 2,
        "consume": 30,
        "range": 2,
        "autoClear": 150,
        "effect": {
            "name": ['levitation'],
            "time": 5
        }
    },
    {
        "name": "奇异光线",
        "id": 5,
        "attribute": "tree",
        "particle": ["dws:tree_light"],
        "base": "dws:greenpoint",
        "value": 11,
        "type": "line",
        "duration": 0,
        "speed": 1,
        "consume": 30,
        "range": 2,
        "autoClear": 150,
        "effect": {
            "name": ["poison"],
            "time": 3
        }
    },
    {
        "name": "能量阵",
        "id": 6,
        "attribute": "all",
        "particle": [],
        "base": null,
        "value": 10,
        "type": "array",
        "duration": 0,
        "speed": 1,
        "consume": 1,
        "range": 6,
        "autoClear": -1,
        "effect": {
            "name": [],
            "time": 5
        }
    },
    {
        "name": "能量晶石（勿点）",
        "id": 7,
        "attribute": "all",
        "particle": [],
        "base": null,
        "value": 10,
        "type": "array",
        "duration": 0,
        "speed": 1,
        "consume": 5,
        "range": 6,
        "autoClear": -1,
        "effect": {
            "name": [],
            "time": 5
        }
    }
];
export var AbProcess = {};
//# sourceMappingURL=abilities.js.map