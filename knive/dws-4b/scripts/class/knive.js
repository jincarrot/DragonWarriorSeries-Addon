import { } from "@minecraft/server"

/**手刀类 */
export class Knive{
    owner;//所有者
    type;//类型
    level;//等级
    /**
     * 
     * @param {string} owner 
     * @param {string} type 
     * @param {number} level 
     */
    constructor(owner, type, level){
        this.owner = owner;
        this.type = type;
        this.level = level;
    }

    /**
     * 使用技能
     */
    useAbility() {
        //
    }
}