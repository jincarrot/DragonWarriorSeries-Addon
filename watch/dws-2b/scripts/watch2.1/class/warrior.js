import { ItemStack, Player, system, world } from "@minecraft/server"
import Dragon from "./dragon";
import { ModalFormData } from "@minecraft/server-ui";
import { DragonID, Dragons, Interact } from "../values/constants"
import { abilities } from "../values/abilities"
import { getEl, getName, getType, title } from "../functions/oracle";
import { DWSUI } from "./ui";


/**
 * @class
 * 战士类
 */
export default class Warrior {
    dragons;//拥有的龙
    base;//玩家本体
    name;//玩家名称
    dragon_data_temp;//宝贝龙暂存数据
    /**
     * name, x, y, z, dim, type
     */
    points;//传送点数据
    evolutions;//进化数据
    cooldown;//龙召唤冷却时间

    /**
     * 
     * @param {Player} base 
     */
    constructor(base) {
        this.name = base.name;
        this.base = base;
        this.dragon_data_temp = {};
        this.dragons = {};//<type, entityId>, store the dragon types which player has
        if (typeof base.getDynamicProperty('dragons') != 'undefined') {
            this.dragons = JSON.parse(base.getDynamicProperty('dragons'));
        }
        this.points = [];
        if (typeof base.getDynamicProperty('points') != 'undefined') {
            this.points = JSON.parse(base.getDynamicProperty('points'));
        }
        if (typeof base.getDynamicProperty('dragon_data_temp') != 'undefined') {
            this.dragon_data_temp = JSON.parse(base.getDynamicProperty('dragon_data_temp'));
        }
        this.evolutions = base.getDynamicProperty('evolutions') || [];
        this.cooldown = JSON.parse(base.getDynamicProperty('cooldown') || "{}");
    }

    /**
     * 执行函数
     * @param {string} txt 
     */
    run(txt) {
        let type = txt.split('(')[0];
        let params = txt.split('(')[1].split(')')[0].split(', ');
        for (let i = 0; i < params.length; i++) params[i] = JSON.parse(params[i]);
        switch (type) {
            case "transDragon":
                this.transDragon(params[0]);
                break;
            case "useAbility":
                var dragon = world.getEntity(this.dragons[params[0]]);
                dragon ? this.useAbility(new Dragon(dragon), params[1]) : null;
                break;
            case "useArray":
                var dragon = world.getEntity(this.dragons[params[0]]);
                dragon ? this.useArray(new Dragon(dragon)) : null;
                break;
            case "teleport":
                let id;
                for (id in this.points) if (this.points[id][0] == params[0]) break;
                this.teleport(id);
                break;
            default:
                break;
        }
    }

    /**召唤宝贝龙 */
    release(type) {
        //召唤宝贝龙
        if (typeof this.cooldown[type] != 'undefined' && this.cooldown[type] > 0) {
            //龙召唤冷却
            title(this.base, `§l§c${getName(type)}§r正在恢复中，请等待${this.cooldown[type]}分钟`);
            return false;
        }
        let p_loc = this.base.location;
        let loc = this.base.location;
        let dim = this.base.dimension;
        let rot = this.base.getViewDirection();
        //方向取整
        rot.x = Math.round(rot.x);
        rot.y = Math.round(rot.y);
        rot.z = Math.round(rot.z);
        //位置判定
        //正常情况
        loc.x += rot.x * 3;
        loc.z += rot.z * 3;
        if (!dim.getBlock(loc)?.isAir) {
            //目标位置无法生成，切换位置
            loc.x -= rot.x;
            loc.z -= rot.z;
            if (!dim.getBlock(loc)?.isAir) {
                //仍无法生成
                loc.x -= rot.x * 2;
                loc.z -= rot.z * 2;
            }
        }
        //特效
        let attr = "";
        for (let el in Dragons) {
            if (Dragons[el][type.split(':')[1]]) {
                attr = el;
                break;
            }
        }
        dim.runCommand(`particle dws:${attr}_emit ${this.base.location.x} ${this.base.location.y} ${this.base.location.z}`);
        system.runTimeout(() => {
            dim.runCommand(`particle dws:${attr}_array ${loc.x} ${loc.y} ${loc.z}`);
            system.runTimeout(() => {
                dim.runCommand(`particle dws:${type}_release ${loc.x} ${loc.y + 1} ${loc.z}`);
                //生成龙
                dim.runCommand(`scoreboard players add @a[name="${this.base.name}"] dws -${Math.floor(loc.x - p_loc.x) + 5}0${Math.floor(loc.z - p_loc.z) + 5}1000${DragonID.indexOf(type.split(':')[1])}`);
                system.runTimeout(() => {
                    if (dim.getEntities({ location: loc, type: type, closest: 1 }).length == 0)
                        dim.runCommand(`execute as @a[name="${this.name}"] at @s run structure load 
                        "${this.name}_${type}" ${loc.x} ${loc.y + 1} ${loc.z}`);
                    let base = dim.getEntities({
                        location: loc,
                        type: type,
                        closest: 1
                    })[0];
                    this.dragons[type] = base.id;
                    this.save('dragons', JSON.stringify(this.dragons));
                    //add the health and the energy to the dragon
                    let data = JSON.parse(this.base.getDynamicProperty('dragon_data_temp') || "{}");
                    if (type in data) {
                        base.setDynamicProperty('energy0', data[type]['energy'][0]);
                        base.setDynamicProperty('exp', data[type]['exp']);
                        base.getComponent('minecraft:health').setCurrentValue(data[type]['health'][0]);
                        let level = Math.floor(Math.sqrt(data[type]['exp'] / 10));
                        let abilities = JSON.parse(base.getDynamicProperty('abilities') || "[]");
                        if (level > 5) abilities = Array.from(new Set(abilities).add(6));
                        if (level > 4) abilities = Array.from(new Set(abilities).add(7));
                        base.setDynamicProperty('abilities', JSON.stringify(abilities));
                        if (data[type]['interact'] > 0){
                            new Dragon(base).Interact(data[type]['interact']);
                        }
                        if (level && level != 1)base.triggerEvent(`dws:lv${level - 1}_${level}`);
                        delete data[type];
                        this.base.setDynamicProperty('dragon_data_temp', JSON.stringify(data));
                    }
                }, 1)
            }, 5);
        }, 10);
        title(this.base, `§l§6${getName(type)}§r已召唤！`);
        return true;
    }
    /**召回宝贝龙 */
    recall(type, interact = -1) {
        this.base.dimension.runCommand(`scoreboard players add @a[name="${this.base.name}"] dws ${DragonID.indexOf(type.split(':')[1]) + 1}`);
        let dragon = new Dragon(world.getEntity(this.dragons[type]), this.name);
        system.runTimeout(() => {
            //临时修改宝贝龙位置，防止宝贝龙重叠
            let loc = dragon.base?.location;
            if (typeof loc != "undefined") {
                loc.y += 1;
                dragon.base?.teleport(loc);
            }
            let dim = dragon.base?.dimension;
            //存储数据
            dim?.runCommand(`structure save "${this.name}_${dragon.type}" 
                ${loc?.x} ${loc?.y} ${loc?.z} 
                ${loc?.x} ${loc?.y} ${loc?.z} 
                true disk`);
            let data = JSON.parse(this.base.getDynamicProperty('dragon_data_temp') || "{}");
            data[type] = {
                'health': [dragon.base?.getComponent('minecraft:health').currentValue, dragon.base?.getComponent('minecraft:health').defaultValue],
                'energy': [dragon.energy[0], dragon.energy[1]],
                'exp': dragon.exp,
                'maxLevel': dragon.maxLevel,
                'interact': interact
            };
            dragon.stopArray();
            this.base.setDynamicProperty('dragon_data_temp', JSON.stringify(data));
            dragon.base?.remove();
        }, 2);
        title(this.base, `§l§6${getName(type)}§r已召回！`);
    }
    /**
     * 召唤/召回宝贝龙
     * @param {string} type 
     *  */
    transDragon(type) {
        world.getEntity(this.dragons[type]) ? this.recall(type) : this.release(type);
    }

    /**传送 */
    teleport(selection) {
        let dim = this.base.dimension;
        //特效
        let point = this.points[selection];
        if (!point[5]) {
            let target = world.getPlayers({ name: point[0] })[0];
            if (!target) {
                title(this.base, '目标玩家离线');
                return;
            }
            point[1] = target.location.x;
            point[2] = target.location.y;
            point[3] = target.location.z;
            point[4] = target.dimension.id;
        }
        let tp_light = dim.spawnEntity(`dws:tp_light`, this.base.location);
        system.runTimeout(() => {
            //执行传送
            let entities = this.base.dimension.getEntities({location: tp_light.location, maxDistance: 3});
            for (let entity of entities){
                entity.teleport({x: Number(point[1]), y: Number(point[2]), z: Number(point[3])}, {dimension: world.getDimension(point[4].split(":")[1])});
            }
            //world.getDimension(this.points[selection][4]).runCommand(`tp @e[x=${tp_light.location.x},y=${tp_light.location.y},z=${tp_light.location.z},r=2] ${point[1]} ${point[2]} ${point[3]}`);
            //移除特效
            tp_light.remove();
        }, 20)
    }
    /**保存坐标点 */
    storePoint(name, loc = { x: 0, y: 0, z: 0 }, dim = 0, type = 1) {
        let dimTypes = ['overworld', 'nether', 'the_end']
        if (!type) {
            for (let point of this.points) {
                if (point[0] == name) {
                    title(this.base, '你已经添加了该玩家的传送点！');
                    return 1;
                }
            }
        }
        this.points.push(
            [name, `${loc.x}`, `${loc.y}`, `${loc.z}`, typeof dim == 'string' ? dim : dimTypes[dim], type]);
        this.base.setDynamicProperty('points', JSON.stringify(this.points));
        title(this.base, `坐标点${name}已添加`);
    }
    /**删除坐标点 */
    removePoint(id) {
        this.points.splice(id, id + 1);
        this.base.setDynamicProperty('points', JSON.stringify(this.points));
    }

    /**使用经验点 */
    useExp(item) {
        let ui = new ModalFormData();
        let list = [];
        let dragon_list = [];
        for (let type in this.dragons) {
            list.push({ rawtext: [{ translate: `entity.${type}.name` }] });
            dragon_list.push(type);
        }
        ui.title(`使用经验点`)
            .dropdown(`用于`, list)
            .slider(`使用量`, 1, item.amount, 1);
        let id = 0;
        ui.show(this.base).then((arg) => {
            if (arg.canceled) return;
            if (typeof arg.formValues != "undefined") {
                //formValue,0为龙，1为数量
                if (typeof arg.formValues[0] == "number")
                    id = arg.formValues[0];
                let amount = arg.formValues[1];
                let type = dragon_list[id];
                //初等级
                if (!world.getEntity(this.dragons[type])) {
                    //未召唤
                    let data = JSON.parse(this.base.getDynamicProperty('dragon_data_temp') || "{}");
                    data[type]['exp'] += amount * 10;
                    if (data[type]['exp'] > 1000 && data[type]['maxLevel'] == 10) {
                        amount -= data[type]['exp'] / 10 - 100;
                        data[type]['exp'] = 1000;
                    }
                    let level = Math.floor(Math.sqrt(data[type]['exp'] / 10));
                    switch (level){
                        case 3:
                            data[type]['energy'] = [30, 30];
                            break;
                        case 4:
                            data[type]['energy'] = [70, 70];
                            break;
                        case 5:
                            data[type]['energy'] = [100, 100]
                            break;
                        default:
                            if (level > 5) {
                                data[type]['energy'] = [level * 20, level * 20];
                            }
                            else { }
                            break;
                    }
                    this.base.setDynamicProperty('dragon_data_temp', JSON.stringify(data));
                    title(this.base, `${getName(type)}已获得经验！`);
                    this.base.dimension.runCommand(`clear "${this.name}" dws:exp -1 ${amount}`);
                    return;
                }
                this.base.dimension.runCommand(`clear "${this.name}" dws:exp -1 ${amount}`);
                system.runTimeout(() => {
                    let dragon = new Dragon(world.getEntity(this.dragons[type]), this.name);
                    let ori = dragon.level;
                    if (typeof id == "number" && typeof amount == "number")
                        dragon.exp += 10 * amount;
                    let loc = dragon.base?.location;
                    if (dragon.exp >= (ori + 1) * (ori + 1) * 10) {
                        //等级提升
                        //计算等级
                        dragon.level = Math.floor(Math.sqrt(dragon.exp / 10));
                        //能量计算
                        switch (dragon.level) {
                            case 3:
                                dragon.energy[0] = 30;
                                dragon.energy[1] = 30;
                                break;
                            case 4:
                                dragon.energy[0] = 70;
                                dragon.energy[1] = 70;
                                break;
                            case 5:
                                dragon.energy[0] = 100;
                                dragon.energy[1] = 100;
                                break;
                            default:
                                if (dragon.level > 5) {
                                    dragon.energy[0] = dragon.level * 20;
                                    dragon.energy[1] = dragon.level * 20;
                                }
                                else { }
                                break;
                        }
                        if (dragon.level > 4) dragon.addAbility(7);
                        if (dragon.level > 5) dragon.addAbility(6);
                        //清理已使用
                        title(this.base, `宝贝龙${getName(dragon.type)}§r已升级至${dragon.level}级！`);
                        if (dragon.exp > 1000) {
                            //已达上限
                            let value = dragon.exp - 1000;
                            dragon.exp = 1000;
                            dragon.level = 10;
                            title(this.base, `等级已到达顶级，无法继续升级，多余经验点已返还`);
                            this.base.dimension.runCommand(`give "${this.name}" dws:exp ${value / 10}`);
                        }
                        for (let i = ori; i < dragon.level; i++) {
                            dragon.base?.triggerEvent(`dws:lv${i}_${i + 1}`);
                        }
                        //粒子
                        this.base.dimension.runCommand(`particle ${dragon.type}_release ${loc?.x} ${loc?.y + 1} ${loc?.z}`);
                        dragon.base?.playAnimation(`animation.${dragon.type.split(':')[1]}.gain_exp`);
                    }
                    //生成特效
                    this.base.dimension.runCommand(`particle dws:gain_exp ${loc?.x} ${loc?.y + 1} ${loc?.z}`);
                    this.base.dimension.runCommand(`playsound random.levelup @a[name="${this.name}"]`);
                    dragon.SetExp('set', dragon.exp);
                }, 1);
            }
        })
    }
    /**
     * 使用龙技能
     * @param {Dragon} dragon 
     * @param {number} id 
     */
    useAbility(dragon, id) {
        dragon.UseAbility(id);
    }
    /**
     * 使用能量阵
     * @param {Dragon} dragon 
     */
    useArray(dragon) {
        let loc = dragon.base.location;
        let dim = this.base.dimension;
        let func = system.runInterval(() => {
            //开始施法
            if (dragon.energy[0] < 20) {
                //能量不足
                system.clearRun(func);
                title(this.base, `能量不足，能量阵已停止`);
            }
            let entities = dim.getEntities({ excludeFamilies: ["monster"], maxDistance: 3, location: loc });
            dim.runCommand(`particle dws:${dragon.el}_array_2 ${loc?.x} ${loc?.y + 0.1} ${loc?.z}`);
            for (let entity of entities) {
                entity.addEffect('strength', 10)
                entity.addEffect('health_boost', 10)
                entity.addEffect('resistance', 10)
            }
            dragon.energy[0] -= 3;
        }, 10)
    }

    /**
     * @function
     * 添加宝贝龙
     */
    addDragon(type, id) {
        this.dragons[type] = id;
        this.base.setDynamicProperty('dragons', JSON.stringify(this.dragons));
        return this;
    }
    /**
     * 
     * @function
     * 移除宝贝龙
     */
    removeDragon(type) {
        delete this.dragons[type];
        this.base.setDynamicProperty('dragons', JSON.stringify(this.dragons));
        return this;
    }
    /**使用手环 */
    useWatch() {
        let ui = new DWSUI();
        let num = 0;
        ui.title(`斗龙手环`)
            .button("召唤/召回", "textures/items/dragon_watch.png")
            .button("使用技能", "textures/particles/firef.png")
            .button("互动", "textures/particles/alla.png")
            .button("传送", "textures/items/tp_card.png")
            .button("斗龙进化", "textures/ui/reguman.v2_1.png")
            .button(`更多`, "textures/ui/alaida.png");
        let sub = new DWSUI();
        ui.show(this.base).then((res) => {
            //子界面
            if (res.canceled) return;
            switch (res.selection) {
                case 0:
                    //召唤召回
                    if (!Object.keys(this.dragons).length) {
                        title(this.base, '你没有宝贝龙！');
                        return;
                    }
                    let keys = Object.keys(this.dragons);
                    sub.title(`召唤/召回§${color}`)
                    for (let type of keys) {
                        sub.button({ rawtext: [{ text: world.getEntity(this.dragons[type]) ? "召回 " : "召唤 " }, { translate: `entity.${type}.name` }] }, `textures/ui/${type.split(":")[1]}.v1.png`)
                    }
                    sub.show(this.base).then((res) => {
                        if (res.canceled) return;
                        if (typeof res.selection != "undefined") {
                            this.transDragon(keys[res.selection]);
                        }
                    });
                    break;
                case 1:
                    //技能
                    sub.title(`选择使用技能的宝贝龙§${color}`);
                    let current = [];
                    for (let type in this.dragons) {
                        if (world.getEntity(this.dragons[type])) {
                            let dragon = new Dragon(world.getEntity(this.dragons[type]), this.name);
                            if (dragon.level > 2) {
                                current.push(type);
                                sub.button({ rawtext: [{ translate: `entity.${type}.name` }] }, `textures/ui/${type.split(":")[1]}.v1.png`)
                            }
                        }
                    }
                    if (!current.length) {
                        title(this.base, '没有可以使用技能的宝贝龙！宝贝龙需要到达3级才可以使用技能！');
                        return;
                    }
                    sub.show(this.base).then((res) => {
                        if (res.canceled) return;
                        if (typeof res.selection != "undefined") {
                            //选择技能
                            sub = new DWSUI()
                            sub.title(`选择技能§${color}`);
                            let type = current[res.selection];
                            let dragon = new Dragon(world.getEntity(this.dragons[type]), this.name);
                            let abilities_ = dragon.abilities;
                            for (let ability of abilities_) sub.button(abilities[ability].name);
                            sub.show(this.base).then((arg) => {
                                if (arg.canceled) return;
                                //使用技能
                                if (typeof arg.selection != "undefined") dragon.UseAbility(abilities_[arg.selection]);
                            })
                        }
                    })
                    break;
                case 2:
                    //互动
                    sub.title(`选择§${color}`);
                    sub.body("该操作将派遣宝贝龙，再次召唤宝贝龙即可完成互动");
                    let ava = [];
                    for (let type in this.dragons) {
                        if (world.getEntity(this.dragons[type])) {
                            let dragon = new Dragon(world.getEntity(this.dragons[type]), this.name);
                            if (dragon.level > 3) {
                                ava.push(type);
                                sub.button(`${getName(type)}\n(${Interact[getEl(type)]}))`, `textures/ui/${dragon.type.split(':')[1]}.v1.png`)
                            }
                        }
                    }
                    if (ava.length == 0) {
                        title(this.base, '没有可以互动的宝贝龙！宝贝龙需要到达4级才可以使用该功能');
                        return;
                    }
                    sub.show(this.base).then((arg) => {
                        //结果
                        if (arg.canceled) return;
                        if (typeof arg.selection != "undefined") {
                            let type = ava[arg.selection];
                            let dragon = new Dragon(world.getEntity(this.dragons[type]));
                            this.recall(type, 0);
                        }
                    })
                    break;
                case 3:
                    //传送
                    sub.title(`传送菜单§${color}`)
                        .body("选择：");
                    //列举坐标点
                    for (let point of this.points) {
                        sub.button(point[0]);
                        num++;
                    }
                    if (num == 0) {
                        title(this.base, '没有坐标点记录');
                        return;
                    }
                    sub.show(this.base).then((res) => {
                        if (res.canceled) return;
                        if (typeof res.selection != "undefined") {
                            this.teleport(res.selection);
                        }
                    })
                    break;
                case 4:
                    //进化
                    let dragons = [];
                    for (let type in this.dragons)
                        if (world.getEntity(this.dragons[type])) {
                            let dragon = new Dragon(world.getEntity(this.dragons[type]), this.name);
                            if (dragon.level >= 10) dragons.push(type);
                        }
                    if (!dragons.length) {
                        title(this.base, '没有可以进化的宝贝龙！');
                        return;
                    }
                    sub = new DWSUI();
                    sub.title(`选择§${color}`);
                    for (let type of dragons) {
                        sub.button(`${new Dragon(world.getEntity(this.dragons[type]), this.name).stage ? '复原' : '进化'}${getName(type)}`, `textures/ui/${type.split(":")[1]}.${new Dragon(world.getEntity(this.dragons[type]), this.name).stage ? 'v1' : 'v2_1'}.png`);
                    }
                    sub.show(this.base).then((res) => {
                        if (res.canceled) return;
                        let dragon = new Dragon(world.getEntity(this.dragons[dragons[res.selection]]), this.name);
                        dragon.stage ? dragon.back() : dragon.LevelUp();
                        this.evolutions.push(dragon.type);
                        this.base.setDynamicProperty('evolutions', this.evolutions);
                    })
                    break;
                case 5:
                    //更多
                    sub.title(`更多§${color}`)
                        .button('宝贝龙信息')
                        .button('传送点删除')
                        .button('快捷方式')
                        .button('手环颜色')
                        .show(this.base).then((arg) => {
                            if (arg.canceled) {
                                return;
                            }
                            else {
                                switch (arg.selection) {
                                    case 0:
                                        //宝贝龙信息
                                        sub = new DWSUI();
                                        sub.title(`信息§${color}`);
                                        for (let type in this.dragons) {
                                            if (world.getEntity(this.dragons[type])) {
                                                let dragon = new Dragon(world.getEntity(this.dragons[type]), this.name);
                                                sub.button({ rawtext: [{ translate: `entity.${type}.name` }, { text: `: \n§7生命:${(dragon.base?.getComponent("health")).currentValue}\n能量:${dragon.energy[0]}/${dragon.energy[1] || 0}\n等级：lv${dragon.level}` }] }, `textures/ui/${dragon.type.split(":")[1]}.v1.png`);
                                            }
                                            else {
                                                let data = JSON.parse(this.base.getDynamicProperty('dragon_data_temp') || "{}");
                                                sub.button({ rawtext: [{ translate: `entity.${type}.name` }, { text: `: \n§7生命:${data[type]['health'][0]}\n能量:${data[type]['energy'][0]}/${data[type]['energy'][1] || 0}\n(未召唤)` }] }, `textures/ui/${type.split(":")[1]}.v1.png`);
                                            }
                                        }
                                        if (!Object.keys(this.dragons).length) { title(this.base, '你没有宝贝龙！'); return; }
                                        sub.show(this.base).then((res)=>{
                                            if (res.canceled) return;
                                            sub = new DWSUI();
                                            sub.title(`${getName(Object.keys(this.dragons)[res.selection])}信息§${color}`);
                                            let base = world.getEntity(this.dragons[Object.keys(this.dragons)[res.selection]]);
                                            let state = base ? 1 : 0;
                                            if (!base && JSON.parse(this.base.getDynamicProperty("dragon_data_temp"))[Object.keys(this.dragons)[res.selection]]['interact'] >= 0) state = JSON.parse(this.base.getDynamicProperty("dragon_data_temp"))[Object.keys(this.dragons)[res.selection]]['interact'] + 10;
                                            let health = base ? [base.getComponent('minecraft:health').currentValue, base.getComponent('minecraft:health').defaultValue] : JSON.parse(this.base.getDynamicProperty('dragon_data_temp'))[Object.keys(this.dragons)[res.selection]]['health'];
                                            let energy = base ? new Dragon(base, this.name).energy : JSON.parse(this.base.getDynamicProperty('dragon_data_temp'))[Object.keys(this.dragons)[res.selection]]['energy'];
                                            let exp = base ? new Dragon(base, this.name).exp : JSON.parse(this.base.getDynamicProperty('dragon_data_temp'))[Object.keys(this.dragons)[res.selection]]['exp'];
                                            let maxLevel = base ? new Dragon(base, this.name).maxLevel : JSON.parse(this.base.getDynamicProperty('dragon_data_temp'))[Object.keys(this.dragons)[res.selection]]['maxLevel'];
                                            sub.body(`状态：${state == 1 ? "已召唤" : (state == 0 ? "召回" : `${Interact[getEl(Object.keys(this.dragons)[res.selection])]}中，已出发${state - 10}分钟`)}\n生命值：${health[0]}/${health[1]}\n能量值：${energy[0]}/${energy[1]}\n等级：lv${Math.floor(Math.sqrt(exp / 10))}/${maxLevel}\n距离下一级还需要${Math.pow(Math.floor(Math.sqrt(exp / 10)) + 1, 2) * 10 - exp}点经验`);
                                            sub.button('确定');
                                            sub.show(this.base);
                                        })
                                        break;
                                    case 1:
                                        sub = new DWSUI()
                                        sub.title(`传送点删除§${color}`)
                                            .body("选择：");
                                        //列举坐标点
                                        for (let point of this.points) {
                                            sub.button(point[0]);
                                            num++;
                                        }
                                        if (num == 0) {
                                            title(this.base, '没有坐标点记录');
                                            return;
                                        }
                                        sub.show(this.base).then((res) => {
                                            if (res.canceled) return;
                                            if (typeof res.selection != "undefined") {
                                                let warn = new DWSUI();
                                                warn.title(`警告§${color}`)
                                                    .body(`确定要删除坐标点${this.points[res.selection][0]}吗？`)
                                                    .button('确定')
                                                    .button('取消')
                                                    .show(this.base).then((arg) => {
                                                        if (arg.canceled) return;
                                                        !arg.selection ? this.removePoint(res.selection) : 0;
                                                    })
                                            }
                                        })
                                        break;
                                    case 2:
                                        //快捷方式
                                        let item = new ItemStack('dws:short_cut', 1);
                                        ui = new DWSUI();
                                        ui.title(`斗龙手环§${color}`)
                                            .body('选择要创建的快捷方式')
                                            .button("召唤/召回", "textures/items/dragon_watch.png")
                                            .button("使用技能", "textures/particles/firef.png")
                                            .button("使用能量阵", "textures/particles/alla.png")
                                            .button("传送", "textures/items/tp_card.png")
                                            .button("斗龙进化", "textures/ui/reguman.v2_1.png")
                                            .show(this.base).then((res) => {
                                                if (res.canceled) return;
                                                switch (res.selection) {
                                                    case 0:
                                                        //召唤召回
                                                        if (!Object.keys(this.dragons).length) {
                                                            title(this.base, '你没有宝贝龙！');
                                                            return;
                                                        }
                                                        let keys = Object.keys(this.dragons);
                                                        sub = new DWSUI();
                                                        sub.title(`选择§${color}`)
                                                        for (let type of keys) {
                                                            sub.button({ rawtext: [{ translate: `entity.${type}.name` }] }, `textures/ui/${type.split(":")[1]}.v1.png`)
                                                        }
                                                        sub.show(this.base).then((res) => {
                                                            if (res.canceled) return;
                                                            if (typeof res.selection != "undefined") {
                                                                item.setLore([`召唤/召回 ${getName(keys[res.selection])}`]);
                                                                this.base.getComponent('minecraft:inventory').container.addItem(item);
                                                            }
                                                        });
                                                        break;
                                                    case 1:
                                                        //技能
                                                        sub = new DWSUI();
                                                        sub.title(`选择使用技能的宝贝龙§${color}`);
                                                        let current = [];
                                                        for (let type in this.dragons) {
                                                            if (world.getEntity(this.dragons[type])) {
                                                                let dragon = new Dragon(world.getEntity(this.dragons[type]), this.name);
                                                                if (dragon.level > 2) {
                                                                    current.push(type);
                                                                    sub.button({ rawtext: [{ translate: `entity.${type}.name` }] }, `textures/ui/${type.split(":")[1]}.v1.png`)
                                                                }
                                                            }
                                                        }
                                                        if (!current.length) {
                                                            title(this.base, '没有可以使用技能的宝贝龙！宝贝龙需要到达3级才可以使用技能！');
                                                            return;
                                                        }
                                                        sub.show(this.base).then((res) => {
                                                            if (res.canceled) return;
                                                            if (typeof res.selection != "undefined") {
                                                                //选择技能
                                                                sub = new DWSUI()
                                                                sub.title(`选择技能§${color}`);
                                                                let type = current[res.selection];
                                                                let dragon = new Dragon(world.getEntity(this.dragons[type]), this.name);
                                                                let abilities_ = dragon.abilities;
                                                                for (let ability of abilities_) sub.button(abilities[ability].name);
                                                                sub.show(this.base).then((arg) => {
                                                                    if (arg.canceled) return;
                                                                    //使用技能
                                                                    item.setLore([`使用技能 ${getName(type)} ${abilities[abilities_[arg.selection]].name}`])
                                                                    this.base.getComponent('minecraft:inventory').container.addItem(item);
                                                                })
                                                            }
                                                        })
                                                        break;
                                                    case 2:
                                                        //能量阵
                                                        sub = new DWSUI();
                                                        sub.title(`选择§${color}`);
                                                        let ava = [];
                                                        for (let type in this.dragons) {
                                                            if (world.getEntity(this.dragons[type])) {
                                                                let dragon = new Dragon(world.getEntity(this.dragons[type]), this.name);
                                                                if (dragon.level > 6) {
                                                                    ava.push(type);
                                                                    sub.button({ rawtext: [{ translate: `entity.${type}.name` }] }, `textures/particles/${dragon.el}a.png`)
                                                                }
                                                            }
                                                        }
                                                        if (ava.length == 0) {
                                                            title(this.base, '没有可以使用能量阵的宝贝龙！宝贝龙需要到达六级才可以使用该功能！');
                                                            return;
                                                        }
                                                        sub.show(this.base).then((arg) => {
                                                            //结果
                                                            if (arg.canceled) return;
                                                            if (typeof arg.selection != "undefined") {
                                                                let type = ava[arg.selection];
                                                                item.setLore([`能量阵 ${getName(type)}`]);
                                                                this.base.getComponent('minecraft:inventory').container.addItem(item);
                                                            }
                                                        })
                                                        break;
                                                    case 3:
                                                        //传送
                                                        sub = new DWSUI();
                                                        sub.title(`传送菜单§${color}`)
                                                            .body("选择：");
                                                        //列举坐标点
                                                        for (let point of this.points) {
                                                            sub.button(point[0]);
                                                            num++;
                                                        }
                                                        if (num == 0) {
                                                            title(this.base, '没有坐标点记录');
                                                            return;
                                                        }
                                                        sub.show(this.base).then((res) => {
                                                            if (res.canceled) return;
                                                            if (typeof res.selection != "undefined") {
                                                                item.setLore([`传送 ${this.points[res.selection][0]}`])
                                                                this.base.getComponent('minecraft:inventory').container.addItem(item);
                                                            }
                                                        })
                                                        break;
                                                    case 4:
                                                        //进化
                                                        break;
                                                }
                                            })
                                        break;
                                    case 3:
                                        //配置手环颜色
                                        let colors = new DWSUI();
                                        colors.title(`选择颜色§${color}`)
                                            .button('黄', 'textures/particles/goldf')
                                            .button('绿', 'textures/particles/treef')
                                            .button('蓝', 'textures/particles/waterf')
                                            .button('红', 'textures/particles/firef')
                                            .button('橙', 'textures/particles/earthf')
                                            .button('紫', 'textures/particles/lightf')
                                            .show(this.base).then((res) => {
                                                colors = ['(', '[', '{', '}', ']', ')']
                                                if (!res.canceled) this.base.setDynamicProperty('color', colors[res.selection]);
                                            })
                                        break;
                                    default:
                                        break;
                                }
                            }
                        })
                    break;
                default:
                    //错误
                    break;
            }
        })
    }
    /**宝贝龙过远保护 */
    protect() {
        for (let type in this.dragons) {
            let dragon = world.getEntity(this.dragons[type]);
            if (dragon) {
                //this dragon is on the world
                if (!dragon.hasTag('sitting')) {
                    let locD = dragon.location;
                    let locP = this.base.location;
                    if (Math.sqrt((locD.x - locP.x) * (locD.x - locP.x) + (locD.z - locP.z) * (locD.z - locP.z)) > 60) {
                        //too far
                        y = locP.y;
                        while (this.base.dimension.getBlock({ x: locP.x, y: y, z: locP.z }).isAir) {
                            y -= 1;
                            if (y < -128) {
                                y = locP.y;
                                break;
                            }
                        }
                        dragon.teleport(locP);
                    }
                }
            }
        }
    }

    /**所有龙生命/能量恢复 */
    recover() {
        for (let type in this.dragons) {
            let dragon = world.getEntity(this.dragons[type]);
            if (!dragon) {
                //in the watch
                if (type in this.dragon_data_temp && this.dragon_data_temp[type]['interact'] < 0) {
                    this.dragon_data_temp[type]['health'][0] += 10;
                    this.dragon_data_temp[type]['energy'][0] += 5;
                    //判断是否超量
                    this.dragon_data_temp[type]['health'][0] > this.dragon_data_temp[type]['health'][1] ? this.dragon_data_temp[type]['health'][0] = this.dragon_data_temp[type]['health'][1] : 0;
                    this.dragon_data_temp[type]['energy'][0] > this.dragon_data_temp[type]['energy'][1] ? this.dragon_data_temp[type]['energy'][0] = this.dragon_data_temp[type]['energy'][1] : 0;
                }
                else {
                    this.dragon_data_temp[type] = {
                        'health': [0, 20],
                        'energy': [0, 0],
                        'exp': 0,
                        'maxLevel': 10,
                        'interact': -1
                    };
                }
                this.base.setDynamicProperty('dragon_data_temp', JSON.stringify(this.dragon_data_temp));
            }
        }
    }

    /**
     * 保存数据
     * @param {string | Array<string>} property 待保存的数据名称
     * @param {string} [data=""] 要保存的数据内容
     */
    save(property = "", data = ""){
        if (property){
            //保存指定数据
            property = typeof property == "string" ? [property] : property;
            for (let i of property){
                this.base.setDynamicProperty(i, JSON.stringify(data ? data : this[i]));
            }
            return;
        }
        //保存全部数据
        for (let type of Object.keys(this)){
            if (['name', 'base'].indexOf(type) < 0) continue;
            this.base.setDynamicProperty(type, JSON.stringify(this[type]));
        }
    }
}