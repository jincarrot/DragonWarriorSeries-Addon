import { system, world } from "@minecraft/server"
import { abilities, AbProcess } from "../values/abilities"
import { title } from "../functions/oracle";
import Dragon from "./dragon";

/**
 * 技能
 */
export class Ability {
    id;
    taskId;
    attacker;
    base;
    cost;
    static taskId;
    /**
     * 
     * @param {number} id 
     * @param {Dragon} base 
     * @param {number} taskId 
     */
    constructor(id, base, taskId = 0) {
        this.id = id;
        this.taskId = taskId ? taskId : Ability.taskId++;
        this.attacker = base;
        this.cost = abilities[id].consume;
    }

    /**
     * 检查技能能否使用
     */
    detect() {
        let data = abilities[this.id];
        let dim = this.attacker.base?.dimension;
        if (this.attacker.energy[0] < data.consume) {
            //能量不足
            title(world.getPlayers({ name: this.attacker.owner })[0], "能量不足，无法使用技能");
            return false;
        }
        let enermies = dim?.getEntities({ families: ["monster"], maxDistance: 20, closest: 1, location: this.attacker.base?.location });
        if (enermies?.length == 0 && data.value >= 0) {
            //没有敌怪，无法使用
            title(world.getPlayers({ name: this.attacker.owner })[0], "没有发现目标，无法使用技能！");
            return false;
        }
        return true;
    }
    /**
     * 预加载技能
     */
    preload() {
        //检测能否正常使用
        if (!this.detect()) return false;
        let loc = this.attacker.base?.location;
        this.attacker.base?.dimension.runCommand(`particle dws:${this.attacker.el}_gather ${loc?.x} ${loc?.y} ${loc?.z}`);
        return true;
    }

    /**
     * 运行技能
     */
    run() {
        if (!this.preload()) return;
        let data = abilities[this.id];
        let loc = this.attacker.base?.location;
        let dim = this.attacker.base?.dimension;
        let enermy = dim?.getEntities({ families: ["monster"], maxDistance: 20, closest: 1, location: this.attacker.base?.location })[0];
        system.runTimeout(() => {
            let func, temp;
            let goal = enermy.location;
            if (["normal", "range", "pierce", "defend"].indexOf(data.type) >= 0) {
                //非光线性攻击
                let base = dim?.spawnEntity(data.base, { x: loc.x, y: loc.y + 1, z: loc.z });
                this.base = base;
                let multiple = Math.floor(Math.sqrt(
                    (goal.x - loc.x) * (goal.x - loc.x) +
                    (goal.y - loc.y) * (goal.y - loc.y) +
                    (goal.z - loc.z) * (goal.z - loc.z)
                ) * data.speed * 200) / 100;//速度计算
                //检测
                this.taskId = system.runInterval(() => {
                    //循环,main
                    goal = enermy.location;
                    base?.applyImpulse({ x: (goal.x - loc.x) / multiple, y: (goal.y - loc.y) / multiple, z: (goal.z - loc.z) / multiple });//移动
                    //特效粒子
                    for (let particle of data.particle) dim?.runCommand(`particle ${particle} ${base?.location.x} ${base?.location.y} ${base?.location.z}`);
                    if (data.value < 0) {
                        //治疗型
                        let goal = dim?.getEntities({ location: loc, maxDistance: data.range, excludeFamilies: ["monster"] });
                        if (typeof goal != "undefined") for (let entity of goal) {
                            //进行治疗
                            (entity.getComponent("health")).setCurrentValue((entity.getComponent("health")).currentValue - data.value);
                        }
                    }
                    else {
                        //攻击/销毁
                        let vec = base?.getVelocity();//本体方向(用于检测是否触碰方块)
                        if (dim?.getBlock({ x: vec?.x + (base?.location.x), y: vec?.y + (base?.location.y), z: vec?.z + (base?.location.z) })?.isAir) {
                            //是空气，检测附近敌怪
                            switch (data.type) {
                                default:
                                    enermies = dim.getEntities({ maxDistance: data.range, location: base?.location, families: ["monster"] });
                                    break;
                                case "normal":
                                    enermies = dim.getEntities({ maxDistance: data.range, location: base?.location, families: ["monster"], closest: 1 });
                                    break;
                            }
                            if (enermies.length == 0) {
                                //无敌怪
                            }
                            else {
                                //遇到目标
                                enermy = enermies[0];
                                //执行伤害
                                enermy.applyDamage(data.value * (1 + Math.floor(Math.sqrt(this.attacker.level))));
                                dim?.runCommand(`particle minecraft:dragon_death_explosion_emitter ${base?.location.x} ${base?.location.y} ${base?.location.z}`);
                                //给予效果
                                for (let i = 0; i < data.effect.name.length; i++) {
                                    if (data.effect.name[i] == "fire") {
                                        //着火
                                        enermy.setOnFire(data.effect.time);
                                    }
                                    else {
                                        //药水效果
                                        enermy.addEffect(data.effect.name[i], data.effect.time);
                                    }
                                }
                                if (data.type == 'defend') {
                                    //防御
                                    enermy.teleport({ x: base?.location.x + (vec?.x * 1.5), y: base?.location.y + (vec?.y), z: base?.location.z + (vec?.z * 1.5) });
                                }
                                else {
                                    system.clearRun(this.taskId);
                                    temp = system.runInterval(() => {
                                        //旧循环停止，新循环
                                        enermies = dim.getEntities({ maxDistance: data.range, location: base?.location, families: ["monster"], closest: 1 });
                                        for (enermy of enermies) {
                                            switch (data.type) {
                                                default:
                                                    enermy.applyDamage(data.value * (1 + Math.floor(Math.sqrt(this.attacker.level))) / 5);
                                                    break;
                                                case 'pierce':
                                                    enermy.applyDamage(data.value * (1 + Math.floor(Math.sqrt(this.attacker.level))));
                                                    break;
                                            }
                                            dim?.runCommand(`particle minecraft:dragon_death_explosion_emitter ${base?.location.x} ${base?.location.y} ${base?.location.z}`);
                                        }
                                    }, 2)
                                    system.runTimeout(() => {
                                        //清理延时
                                        base?.remove();
                                        system.clearRun(temp);
                                    }, data.duration);
                                }
                            }
                        }
                        else {
                            //遇到方块，自动销毁
                            this.destory();
                        }
                    }
                }, 2)
                base?.setDynamicProperty('taskId', this.taskId);
            }
            else if (data.type == "line") {
                //线性攻击
                //技能本体
                let points = [[0, 0, 0]];
                let base = dim?.spawnEntity(data.base, loc);
                let distance = Math.sqrt((goal.x - loc.x) * (goal.x - loc.x) +
                    (goal.y - loc.y + 1) * (goal.y - loc.y + 1) +
                    (goal.z - loc.z) * (goal.z - loc.z));
                points.pop();
                for (let i = 0; i < 64; i++) {
                    points.push([loc.x + i * (goal.x - loc.x) / distance / 4, loc.y + i * (goal.y - loc.y) / distance / 4, loc.z + i * (goal.z - loc.z) / distance / 4])
                }
                for (let point of points) {
                    for (let particle of data.particle) dim?.runCommand(`particle ${particle} ${point[0]} ${point[1]} ${point[2]}`);
                }
                let multiple = Math.floor(Math.sqrt(
                    (goal.x - loc.x) * (goal.x - loc.x) +
                    (goal.y - loc.y + 1) * (goal.y - loc.y + 1) +
                    (goal.z - loc.z) * (goal.z - loc.z)
                ) * data.speed * 200) / 100;//速度计算
                let r = Math.floor(Math.sqrt((base?.location.x - loc.x) * (base?.location.x - loc.x)
                    + (base?.location.y - loc.y) * (base?.location.y - loc.y)
                    + (base?.location.z - loc.z) * (base?.location.z - loc.z)));
                let vec = { x: (goal.x - loc.x) / multiple, y: (goal.y - loc.y) / multiple, z: (goal.z - loc.z) / multiple };
                this.taskId = func = system.runInterval(() => {
                    let entities = dim?.getEntities({ location: loc, maxDistance: r, families: ["monster"] });
                    if (typeof entities != "undefined") for (let entity of entities) {
                        //判断是否位于线上
                        //x-y
                        //x-z
                        //y-z
                        if (typeof vec != "undefined")
                            if (vec.y / vec.x - 0.6 < (entity.location.y - loc.y) / (entity.location.x - loc.x) && (entity.location.y - loc.y) / (entity.location.x - loc.x) < vec.y / vec.x + 0.6
                                && vec.z / vec.x - 0.6 < (entity.location.z - loc.z) / (entity.location.x - loc.x) && (entity.location.z - loc.z) / (entity.location.x - loc.x) < vec.z / vec.x + 0.6
                                && vec.y / vec.z - 0.6 < (entity.location.y - loc.y) / (entity.location.z - loc.z) && (entity.location.y - loc.y) / (entity.location.z - loc.z) < vec.y / vec.z + 0.6
                                && (entity.location.x - loc.x) >= 0 && (entity.location.y - loc.y) >= 0 && (entity.location.z - loc.z) >= 0) {
                                //命中
                                entity.applyDamage(data.value);
                                for (let effect of data.effect.name) entity.addEffect(effect, data.effect.time);
                            }
                    }
                }, 2)
            }
            else if (data.type == "array"){
                //阵法
                this.base = null;
                this.taskId = system.runInterval(()=>{
                    if (this.attacker.energy[0] < data.consume) {
                        //能量不足，停止技能
                        this.attacker.stopArray();
                        title(world.getPlayers({ name: this.attacker.owner })[0], "能量不足，能量阵停止！");
                        return;
                    }
                    let entities = dim.getEntities({ excludeFamilies: ["monster"], maxDistance: data['range'], location: loc });
                    dim.runCommand(`particle dws:${this.attacker.el}_array_2 ${loc?.x} ${loc?.y + 0.1} ${loc?.z}`);
                    for (let entity of entities) {
                        entity.addEffect('strength', 100, {amplifier: 3})
                        entity.addEffect('health_boost', 100, {amplifier: 3})
                        entity.addEffect('resistance', 100, {amplifier: 3})
                    }
                    this.attacker.reduceEnergy(data.consume);
                }, 10)
            }
            else if (data.type == "spirit"){
                //精灵
            }
            if (data["autoClear"] >= 0)system.runTimeout(() => {
                //自动清理
                this.stop()
            }, data['autoClear'])
            AbProcess[this.taskId] = this;
        }, data.type == "array" ? 2 : 25)
        //清理能量
        this.attacker.energy[0] -= data.consume;
        this.attacker.base?.setDynamicProperty('energy0', this.attacker.energy[0]);
    }

    /**
     * 销毁技能
     */
    destory() {
        let dim = this.attacker.base?.dimension;
        let data = abilities[this.id];
        let base = this.base;
        dim?.runCommand(`damage @e[x=${base?.location.x},y=${base?.location.y},z=${base?.location.z},r=4] ${Math.floor(data.value * (1 + Math.sqrt(this.attacker.level)) / 5)}`);
        //爆炸
        dim?.runCommand(`particle minecraft:dragon_death_explosion_emitter ${base?.location.x} ${base?.location.y} ${base?.location.z}`);
        dim?.runCommand(`playsound random.explose @a ${base?.location.x} ${base?.location.y} ${base?.location.z}`);
        base?.remove();
        system.clearRun(this.taskId);
    }

    /**
     * 技能停止
     */
    stop() {
        if (this.base?.isValid() || !this.base) {
            this.base?.remove();
            system.clearRun(this.taskId);
        }
    }
}
