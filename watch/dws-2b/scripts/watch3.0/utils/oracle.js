import { Player } from "@minecraft/server"
import { DragonID, Dragons } from "../values/constants";
import { abilities } from "../values/abilities";

export function title(target, txt){
    target.dimension.runCommand(`title "${target.name}" actionbar ${txt}`);
}

/**
 * 由类型名获取中文名
 * @param {string} type 
 * @returns 
 */
export function getName(type){
    for (let el in Dragons){
        if (type.split(':')[1] in Dragons[el]) return Dragons[el][type.split(':')[1]]['zh_CN']
    }
}

/**
 * 由类型名获取属性
 * @param {string} type 
 * @returns 
 */
export function getEl(type){
    for (let el in Dragons){
        if (type.split(':')[1] in Dragons[el]) return el;
    }
}

/**
 * 由中文名获取龙type
 * @param {string} name 
 * @returns 
 */
export function getType(name){
    for (let el in Dragons){
        for (let dragon in Dragons[el]){
            if (Dragons[el][dragon]['zh_CN'] == name) return 'dws:' + dragon;
        }
    }
    return null;
}

/**
 * 由技能名获取技能id
 * @param {string} name 
 * @returns 
 */
export function getAbility(name){
    for (let ability of abilities ){
        if (ability.name == name) return ability.id;
    }
    return null;
}