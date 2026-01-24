import { system, world } from "@minecraft/server"

let aEvent = world.afterEvents;
let bEvent = world.beforeEvents;
let Attr = ["fire", "gold", "tree", "water", "earth", "light"]
const Dragons = {
    "gold": {
        'kavili': {
            'zh_CN': '卡维力',
            'abilities': [1],
        }
    },
    "tree": {
        'semela': {
            'zh_CN': "森美拉",
            'abilities': [5],
        }
    },
    "water": {
        'gabina': {
            'zh_CN': '加比纳',
            'abilities': [2]
        },
        'hynas': {
            'zh_CN': '海纳斯',
            'abilities': []
        }
    },
    "fire": {
        'reguman': {
            'zh_CN': '雷古曼',
            'abilities': [0]
        },
        "darigu": {
            'zh_CN': '达力古',
            'abilities': []
        }
    },
    "earth": {
        'giardo': {
            'zh_CN': '吉亚多',
            'abilities': [3]
        }
    },
    "light": {
        'sori': {
            'zh_CN': '索里',
            "abilities": [4]
        }
    }
}


function main() {
    //粒子
    let dim_id = ["overworld", "nether", "the_end"];
    for (let id of dim_id) {
        for (let attr of Attr) {
            world.getDimension(id).
            runCommand(`/execute as @e[type=dws:${attr}_zombie] at @s run particle dws:${attr}_zombie ~~~`);
        }
    }
}

aEvent.entityHitEntity.subscribe((arg) => {
    let source = arg.damagingEntity;
    if (source.typeId == "dws:fire_zombie") {
        //火象僵尸，可造成火焰伤害
        arg.hitEntity.setOnFire(2);
    }
    else if (source.typeId == "dws:gold_zombie") {
        //金象僵尸，遇火斩杀
        if (typeof source.getComponent("minecraft:onfire") != "undefined") {
            //着火
            arg.hitEntity.applyDamage(1000);
        }
    }
})

aEvent.entityHitEntity.subscribe((arg)=>{
    if (Object.keys(Dragons).indexOf(arg.damagingEntity.typeId) >= 0){
        //龙攻击，后撤步
        let dragon = arg.damagingEntity;
        let rot = dragon.getRotation();
        dragon.applyImpulse({x: Math.sin(rot.x), y: 0, z: Math.cos(rot.x)});
    }
})

system.runInterval(main, 20)