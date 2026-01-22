import { AbilityType, TraceModeType } from "../enums/ability";
import { ElementType } from "../enums/attr";
import { manager } from "../managers/manager";
import { Ray } from "../modules/collisions";
import { alert } from "../utils/debug";
import { getClosestEnermy } from "../utils/game";
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
function normalAbilityCallback(attr) {
    return {
        start: (ability) => {
            var _a;
            ability.spawnProjectile(attr.projectileType, ability.user.base.location, attr.trace ? TraceModeType.Trace : TraceModeType.Simple);
            if ((_a = attr.particles) === null || _a === void 0 ? void 0 : _a.initial) {
                let loc = ability.user.base.location;
                for (let particleName of attr.particles.initial)
                    ability.user.base.dimension.spawnParticle(particleName, loc);
            }
        },
        projectileCallbacks: {
            hitEntity: (projectile, target) => {
                var _a;
                let ability = manager.ability.getFromProjectile(projectile.base);
                target.applyDamage(attr.damage * (1 + ((ability === null || ability === void 0 ? void 0 : ability.user.level) || 1) / 10.0));
                alert(`${ability === null || ability === void 0 ? void 0 : ability.user.level}`);
                if (attr.effects)
                    for (let effectName in attr.effects) {
                        if (effectName == "fire") {
                            target.setOnFire(attr.effects[effectName][0] * (1 + ((ability === null || ability === void 0 ? void 0 : ability.user.level) || 1) / 10.0));
                            continue;
                        }
                        target.addEffect(effectName, attr.effects[effectName][0], { amplifier: attr.effects[effectName][1] });
                    }
                if ((_a = attr.particles) === null || _a === void 0 ? void 0 : _a.hitEntity) {
                    let loc = projectile.base.location;
                    for (let particleName of attr.particles.hitEntity)
                        projectile.base.dimension.spawnParticle(particleName, loc);
                }
            },
            hitBlock: (projectile, location) => {
                var _a;
                if ((_a = attr.particles) === null || _a === void 0 ? void 0 : _a.hitBlock) {
                    let loc = location;
                    for (let particleName of attr.particles.hitBlock)
                        projectile.base.dimension.spawnParticle(particleName, loc);
                }
                projectile.base.dimension.createExplosion(location, attr.damage / 5);
            },
            main: (projectile) => {
                var _a;
                if ((_a = attr.particles) === null || _a === void 0 ? void 0 : _a.runtime) {
                    let loc = projectile.base.location;
                    for (let particleName of attr.particles.runtime)
                        projectile.base.dimension.spawnParticle(particleName, loc);
                }
            }
        }
    };
}
export const ABILITIES = {
    0: {
        name: "响雷火球",
        attributes: [ElementType.Fire],
        types: [AbilityType.Offensive],
        cost: 30,
        duration: 150,
        projectileAttr: {
            speed: 1,
            range: 2
        },
        callbacks: normalAbilityCallback({
            projectileType: "dws:fire_ball",
            damage: 11,
            effects: {
                "fire": [5, 0]
            }
        })
    },
    1: {
        name: "奇异光线",
        attributes: [ElementType.Wood],
        types: [AbilityType.Offensive],
        cost: 30,
        duration: 150,
        callbacks: {
            start: (ability) => {
                let target = getClosestEnermy(ability.user.base);
                if (!target)
                    return;
                let dir = {
                    x: target.location.x - ability.user.base.location.x,
                    y: target.location.y - ability.user.base.location.y,
                    z: target.location.z - ability.user.base.location.z
                };
                let collision = new Ray(ability.user.base.location, dir, 10, ability.user.base.dimension);
                ability.createDetection(collision);
            },
            detectingCallbacks: {
                main: (box) => {
                    for (let entity of box.entities)
                        entity.applyDamage(5);
                }
            }
        }
    }
};
//# sourceMappingURL=abilities.js.map