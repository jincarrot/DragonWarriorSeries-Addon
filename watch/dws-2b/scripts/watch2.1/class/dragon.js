import { Entity, ItemStack, system, world } from "@minecraft/server"
import { Ability } from "./ability";
import { Dragons } from "../values/constants";
import { getEl, title } from "../functions/oracle";
import { AbProcess } from "../values/abilities";
import Warrior from "./warrior";

/**
 * @class
 * 龙类
 */
export default class Dragon {
    owner;//主人名称
    uuid;//uuid
    /**含 “dws：” */
    type;//宝贝龙名称
    base;//宝贝龙主体
    memory;//宝贝龙攻击AI数据
    stage;//龙状态（宝贝龙/进化）
    maxLevel;//最大等级
    energy;//能量值【当前/最高】
    strength;//坚韧度
    abilities;//技能id列表
    el;//龙属性（金，木……）
    exp;//经验
    level;//等级
    priority;//优先攻击谁，true为怪物,false为生物

    /**
     * @param {Entity | string} base
     * @param {string} owner
     * @param {string} uuid
     * @param {string} type
     * @param {number} stage
     * @param {number[]} energy
     * @param {number} strength
     * @param {Object} memory
     * @param {number} exp
     * @param {number} level
     * @param {string[]} abilities
     * @param {string} el
     * @param {boolean} priority
     */
    constructor(base, owner) {
        this.base = typeof base == 'string' ? world.getEntity(base) : base;
        this.uuid = base.id;
        this.owner = owner;
        this.type = this.base.typeId.split('_')[0];
        this.stage = this.base.typeId.split('_').length - 1;
        this.energy = [0, 0];
        this.strength = 1;
        this.el = getEl(this.type);
        this.abilities = Dragons[this.el][this.type.split(':')[1]]['abilities']
        this.memory = new Object();
        this.exp = 10;
        this.level = 1;
        this.maxLevel = 10;
        //技能赋予
        if (typeof this.base.getDynamicProperty('energy0') != 'undefined') {
            this.energy = [this.base.getDynamicProperty('energy0'), this.base.getDynamicProperty('energy1')];
        }
        if (typeof this.base.getDynamicProperty('exp') != 'undefined') {
            this.exp = this.base.getDynamicProperty('exp');
        }
        if (typeof this.base.getDynamicProperty('abilities') != 'undefined') {
            this.abilities = JSON.parse(this.base.getDynamicProperty('abilities'));
        }
        else this.base.setDynamicProperty('abilities', JSON.stringify(this.abilities));
        if (typeof this.base.getDynamicProperty('maxLevel') != 'undefined') {
            this.maxLevel = this.base.getDynamicProperty('maxLevel');
        }
        this.level = Math.floor(Math.sqrt(this.exp / 10));
    }

    /**进化 */
    LevelUp() {
        this.stage = 1;
        this.base.setDynamicProperty('stage', this.stage);
        let loc = this.base.location;
        let dim = this.base.dimension;
        //播放进化动画1
        this.base?.playAnimation(`animation.${this.type.split(':')[1]}.gain_exp`);
        dim?.runCommand(`particle dws:gain_exp ${loc?.x} ${loc?.y + 1} ${loc?.z}`);
        dim?.runCommand(`particle dws:${getEl(this.type)}_zombie ${loc?.x} ${loc?.y} ${loc?.z}`);
        system.runTimeout(() => {
            dim.runCommand(`particle dws:${getEl(this.type)}_array_2 ${loc.x} ${loc.y + 0.1} ${loc.z}`);
            system.runTimeout(() => {
                //转存数据
                let data = {
                    energy: [this.base.getDynamicProperty('energy0'), this.base.getDynamicProperty('energy1')],
                    abilities: this.base.getDynamicProperty('abilities'),
                    exp: this.base.getDynamicProperty('exp'),
                    maxLevel: this.base.getDynamicProperty('maxLevel')
                }
                //进化
                this.base.triggerEvent(`dws:levelup`);
                this.base.setDynamicProperty('energy0', data.energy[0]);
                this.base.setDynamicProperty('energy1', data.energy[1]);
                this.base.setDynamicProperty('abilities', data.abilities);
                this.base.setDynamicProperty('exp', data.exp);
                this.base.setDynamicProperty('maxLevel', data.maxLevel);
                let owner = world.getPlayers({ name: this.owner })[0];
                let dragons = JSON.parse(owner.getDynamicProperty('dragons'));
                dragons[this.type] = this.base.id;
                owner.setDynamicProperty('dragons', JSON.stringify(dragons));
                //播放进化动画2
                this.base?.playAnimation(`animation.levelup.born`);
                dim?.runCommand(`particle dws:${getEl(this.type)}_burst ${loc?.x} ${loc?.y + 1} ${loc?.z}`);
            }, 5);
        }, 30);
    }
    /** 复原 */
    back() {
        let data = {
            energy: [this.base.getDynamicProperty('energy0'), this.base.getDynamicProperty('energy1')],
            abilities: this.base.getDynamicProperty('abilities'),
            exp: this.base.getDynamicProperty('exp'),
            maxLevel: this.base.getDynamicProperty('maxLevel')
        }
        this.base.triggerEvent(`dws:back`);
        this.base.setDynamicProperty('energy0', data.energy[0]);
        this.base.setDynamicProperty('energy1', data.energy[1]);
        this.base.setDynamicProperty('abilities', data.abilities);
        this.base.setDynamicProperty('exp', data.exp);
        this.base.setDynamicProperty('maxLevel', data.maxLevel);
    }
    /**使用技能 */
    UseAbility(id) {
        let ab = new Ability(id, this);
        if (id == 6) {
            if (typeof this.base.getDynamicProperty('array') == 'number') {
                //使用中
                AbProcess[this.base.getDynamicProperty('array')].stop();
                delete AbProcess[this.base.getDynamicProperty('array')];
                this.base.setDynamicProperty('array', " ");
                return;
            }
            else system.runTimeout(() => this.base.setDynamicProperty('array', ab.taskId), 30);
        }
        ab.run();
    }
    /**停止使用能量阵 */
    stopArray() {
        if (typeof this.base.getDynamicProperty('array') == 'number') {
            AbProcess[this.base.getDynamicProperty('array')].stop();
            delete AbProcess[this.base.getDynamicProperty('array')];
            title(world.getPlayers({ name: this.owner })[0], `§c能量阵已停止`);
            this.base.setDynamicProperty('array', " ");
        }
    }
    /**增加技能 */
    addAbility(id) {
        this.abilities = Array.from(new Set(this.abilities).add(id));
        this.base.setDynamicProperty('abilities', JSON.stringify(this.abilities));
    }
    /**交互功能 */
    Interact(time) {
        if (time > 20) time = 20;
        switch (this.el) {
            case "gold":
                //采矿
                var reward = {};
                reward['coal'] = time * 3;
                reward['gold_ingot'] = Math.floor(time * 1.5);
                if (time > 8) reward['iron_ingot'] = (time - 5) * 2;
                if (time > 15) reward['diamond'] = (time - 10) * 1;
                for (let type in reward) {
                    let item = new ItemStack(`minecraft:${type}`, reward[type]);
                    this.base.dimension.spawnItem(item, this.base.location);
                }
                break;
            case "tree":
                //种植
                var reward = {};
                let CropTypes = ['wheat', 'carrot', 'potato', 'beetroot'];
                for (let i = 0; i < time; i++) {
                    reward[CropTypes[Math.floor(Math.random() * CropTypes.length)]] = reward[CropTypes[Math.floor(Math.random() * CropTypes.length)]] ? reward[CropTypes[Math.floor(Math.random() * CropTypes.length)]] + 5 : 5;
                }
                for (let type in reward) {
                    let item = new ItemStack(`minecraft:${type}`, reward[type]);
                    this.base.dimension.spawnItem(item, this.base.location);
                }
                break;
            case "water":
                //捕鱼
                var reward = {};
                reward['cod'] = time * 4;
                for (let i = time - 15; i >= 0; i--) {
                    if (Math.random() < 0.08) reward['fishing_rod'] = 1;
                    if (Math.random() > 0.92) reward['bow'] = 1;
                }
                for (let type in reward) {
                    let item = new ItemStack(`minecraft:${type}`, reward[type]);
                    this.base.dimension.spawnItem(item, this.base.location);
                }
                break;
            case "fire":
                //烹饪
                var reward = {};
                let FoodTypes = ['cooked_beef', 'cooked_chicken', 'cooked_mutton', 'cooked_porkchop', 'cooked_rabbit', 'cooked_cod', 'cooked_salmon'];
                for (let i = 0; i < time; i++) {
                    reward[FoodTypes[Math.floor(Math.random() * FoodTypes.length)]] = reward[FoodTypes[Math.floor(Math.random() * FoodTypes.length)]] ? reward[FoodTypes[Math.floor(Math.random() * FoodTypes.length)]] + 2 : 2;
                }
                for (let type in reward) {
                    let item = new ItemStack(`minecraft:${type}`, reward[type]);
                    this.base.dimension.spawnItem(item, this.base.location);
                }
                break;
            case "earth":
                //挖宝
                let money = Math.fllor(time * 10 * Math.random());
                this.base.dimension.runCommand(`moneys add ${this.owner} ${money}`);
                title(world.getPlayers({ name: this.owner })[0], `§a挖宝获得了§e${money}§a龙鳞`);
                break;
            case "light":
                //打猎
                let item = new ItemStack(`dws:exp`, Math.floor(time / 2));
                this.base.dimension.spawnItem(item, this.base.location);
                break;
            default:
                break;
        }
    }
    /**修改经验值 */
    SetExp(mode, amount = 0) {
        switch (mode) {
            case "add":
                //增加
                this.exp += amount;
                this.level = Math.floor(Math.sqrt(this.exp / 10));
                break;
            case "remove":
                //减少
                this.exp -= amount;
                this.level = Math.floor(Math.sqrt(this.exp / 10));
                break;
            case "set":
                //设置
                this.exp = amount;
                this.level = Math.floor(Math.sqrt(this.exp / 10));
                break;
            case "reset":
                this.exp = 0;
                this.level = 1;
                break;
            //清零
            default:
                break;
        }
        this.base.setDynamicProperty('exp', this.exp);
        this.base.setDynamicProperty('energy0', this.energy[0]);
        this.base.setDynamicProperty('energy1', this.energy[1]);
    }
    setMaxLevel(level) {
        this.maxLevel = level;
        this.base.setDynamicProperty('maxLevel', this.maxLevel);
    }
    reduceEnergy(amount) {
        this.energy[0] -= amount;
        this.base.setDynamicProperty('energy0', this.energy[0]);
    }
    /**
     * 写入暂存数据
     * @param {Warrior} owner 
     */
    saveData(owner) {
        let data = JSON.parse(owner.dragon_data_temp || "{}")[this.type];
        if (data) {
            this.base.setDynamicProperty('energy0', data[type]['energy'][0]);
            this.base.setDynamicProperty('exp', data[type]['exp']);
            this.base.getComponent('minecraft:health').setCurrentValue(data[type]['health'][0]);
        }
    }
    /**设置 */
    Option() {
        //设置
    }
    /**自动执行 */
    AI() {
        //龙智能
    }
}