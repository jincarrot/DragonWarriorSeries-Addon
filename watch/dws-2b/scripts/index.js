import { EntityComponentTypes, system, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import Warrior from "./watch2.1/class/warrior";
import { DragonID, Dragons } from "./watch2.1/values/constants";
import { getAbility, getName, getType, title } from "./watch2.1/functions/oracle";
import Dragon from "./watch2.1/class/dragon";
import { DWSUI } from "./watch2.1/class/ui";

// dws3-watch

const aEvent = world.afterEvents;
const bEvent = world.beforeEvents;
const funcID = { '召唤/召回': 'transDragon', '使用技能': 'useAbility', '使用能量阵': 'useArray', '传送': 'teleport' }

function main() {
    //触发器
    aEvent.itemUse.subscribe((arg) => {
        //物品使用
        if (arg.itemStack.typeId == `dws:dragon_watch`) {
            //手环使用
            let warrior = new Warrior(arg.source);
            warrior.useWatch();
        }
        else if (arg.itemStack.typeId == `dws:tp_card`) {
            //传送卡使用
            let player = arg.source;
            if (arg.itemStack.getLore().length) {
                //已绑定玩家
                let lore = arg.itemStack.getLore();
                if (lore[0].indexOf(player.name) >= 0) {
                    //绑定玩家自身使用
                    title(player, '这是你自己的传送卡！')
                }
                else {
                    let warrior = new Warrior(player);
                    if (warrior.storePoint(lore[0].split('：')[1], 0, 0, 0)) return;
                    let inv = player.getComponent('minecraft:inventory');
                    let container = inv.container;
                    let size = container.size;
                    for (let i = 0; i < size; i++) {
                        let item = container.getItem(i);
                        if (item && item.typeId == 'dws:tp_card' && item.getLore().length && item.getLore()[0] == lore[0]) {
                            //有物品
                            let clear = 0;
                            item.amount == 1 ? clear = 1 : item.amount -= 1;
                            container.setItem(i, !clear ? item : null);
                            break;
                        }
                    }
                }
                return;
            }
            let alert = new DWSUI();
            alert.title("选择传送点刻录模式")
                .body(``)
                .button(`刻录当前位置`)
                .button(`刻录玩家位置`);
            alert.show(player).then((res) => {
                if (res.canceled) return;
                switch (res.selection) {
                    case 0:
                        //当前位置
                        let sub = new ModalFormData();
                        let warrior = new Warrior(player);
                        sub.title(`保存坐标点§${player.getDynamicProperty('color') || 'w'}`)
                            .textField(`输入名称`, ` `)
                            .show(player).then((res) => {
                                if (res.formValues)
                                    warrior.storePoint(`${res.formValues[0]}`, player.location, player.dimension.id);
                                //清理传送卡
                                let inv = player.getComponent('minecraft:inventory');
                                let container = inv.container;
                                let size = container.size;
                                for (let i = 0; i < size; i++) {
                                    let item = container.getItem(i);
                                    if (item && item.typeId == 'dws:tp_card' && !item.getLore().length) {
                                        //有物品
                                        let clear = 0;
                                        item.amount == 1 ? clear = 1 : item.amount -= 1;
                                        container.setItem(i, !clear ? item : null);
                                        break;
                                    }
                                }
                            })
                        break;
                    case 1:
                        //玩家位置
                        alert = new DWSUI();
                        alert.title(`提示`)
                            .body('此操作将会记录您的实时位置，当您将该传送卡给予其他玩家时，该玩家将获得传送至您的权力')
                            .button('确定')
                            .button('取消')
                            .show(player).then((res) => {
                                if (res.canceled || res.selection) return;
                                let inv = player.getComponent("minecraft:inventory");
                                let container = inv.container;
                                let size = container.size;
                                for (let i = 0; i < size; i++) {
                                    let item = container.getItem(i);
                                    if (item && item.typeId == 'dws:tp_card' && !item.getLore().length) {
                                        //有物品
                                        let clear = 0;
                                        item.amount == 1 ? clear = 1 : item.amount -= 1;
                                        container.setItem(i, !clear ? item : null);
                                        break;
                                    }
                                }
                                let item = arg.itemStack;
                                item.setLore([`目标玩家：${player.name}`]);
                                item.amount = 1;
                                inv.container.addItem(item);
                            })
                        break;
                    default:
                        break;
                }
            })
        }
        else if (arg.itemStack.typeId == `dws:exp`) {
            //经验点使用
            let warrior = new Warrior(arg.source);
            if (typeof warrior != "undefined") {
                warrior.useExp(arg.itemStack);
            }
        }
        else if (arg.itemStack.typeId == 'dws:nether_star') {
            let alert = new DWSUI();
            alert.title(`提示`)
                .body('下界之星似乎拥有了一种牵引力量……\n是否跟随这股力量，找寻力量的本源？')
                .button('确定')
                .button('取消')
                .show(arg.source).then((res) => {
                    if (res.canceled) return;
                    if (res.selection == 0) {
                        if (arg.source.dimension.runCommand(`clear @a[name="${arg.source.name}"] nether_star 0 1`).successCount) {
                            let warrior = new Warrior(arg.source);
                            for (let type in warrior.dragons) {
                                if (world.getEntity(warrior.dragons[type])) {
                                    warrior.recall(type)
                                }
                            }
                            arg.source.dimension.runCommand(`execute as @a[name="${arg.source.name}"] at @s run trans temp`);
                        }
                        else {
                            title(arg.source, '下界之星被藏起来了吗……');
                        }
                    }
                })
        }
        else if (arg.itemStack.typeId == 'dws:universe_stone') {
            if (!arg.source.getDynamicProperty('world')) {
                arg.source.setDynamicProperty('world', "1");
                title(arg.source, '已成功激活前往斗龙世界的能力');
                arg.source.dimension.runCommand(`clear @a[name="${arg.source.name}"] dws:universe_stone 0 1`);
            }
            else {
                title(arg.source, '你已经激活了前往斗龙世界的能力了！');
            }
        }
        else if (arg.itemStack.typeId == 'dws:short_cut') {
            //快捷方式
            //解析快捷方式
            let item = arg.itemStack;
            let lores = item.getLore();
            if (lores.length == 1) {
                let lore = lores[0];
                let values = lore.split(' ');
                let func = funcID[values[0]] || "1";
                func += "(";
                for (let i = 1; i < values.length; i++) func += (i == 1 ? '' : ', ') + ((Number(values[i]) || Number(values[i]) == 0) ? values[i] : '"' + (getType(values[i]) || getAbility(values[i])) + '"');
                func += ")";
                let warrior = new Warrior(arg.source);
                func.indexOf("1") != 0 ? warrior.run(func) : title(arg.itemStack, '出错了');
            }
            else {
                title(arg.source, '出错了');
            }
        }
        else if (arg.itemStack.typeId == 'dws:energy_cluster') {
            //进化石
            let player = arg.source;
            let warrior = new Warrior(player);
            let dragons = warrior.dragons;
            let available = [];
            for (let type in dragons) {
                if (world.getEntity(dragons[type])) {
                    //有龙
                    let dragon = new Dragon(world.getEntity(dragons[type]), player.name);
                    if (dragon.level >= 10 && dragon.maxLevel == 10) available.push(getName(type));
                }
            }
            if (available.length == 0) {
                title(player, '没有可以进化的龙！');
                return;
            }
            let ui = new ModalFormData();
            let color = player.getDynamicProperty('color') || "w";
            ui.title(`选择§${color}`)
                .dropdown('用于', available)
                .show(player).then((res) => {
                    if (res.canceled) return;
                    let id = res.formValues[0];
                    let type = getType(available[id]);
                    let dragon = new Dragon(world.getEntity(dragons[type]), player.name);
                    dragon.setMaxLevel(20);
                    dragon.SetExp('add', 210);
                    player.dimension.runCommand(`clear @a[name="${player.name}"] dws:energy_cluster 0 1`);
                    title(player, `${available[id]}已激活进化`);
                })

        }
        else for (let i = 0; i < DragonID.length; i++) {
            if (arg.itemStack.typeId == `dws:${DragonID[i]}_spawn_egg`) {
                //summon dragon
                let player = arg.source;
                //give a watch if player has no watch
                player.dimension.runCommand(`give @a[hasitem={item=dws:dragon_watch,quantity=0},name="${player.name}"] dws:dragon_watch 1 0`);
                let warrior = new Warrior(player);
                //get the dragon type
                let type = arg.itemStack.typeId.split("_", 1)[0];
                if (!warrior.dragons[type]) {
                    player.dimension.runCommand(`give @a[name="${player.name}"] cooked_chicken 1 0`);
                    player.dimension.runCommand(`clear @a[name="${player.name}"] ${arg.itemStack.typeId} 0 1`);
                    //player do not has this dragon
                    //get the summon location
                    let loc = arg.source.location;
                    player.dimension.runCommand(`particle ${type}_release ${loc.x} ${loc.y} ${loc.z}`);
                    system.runTimeout(() => {
                        let dragon = player.dimension.spawnEntity(type, loc);
                        dragon.setDynamicProperty('owner', player.name);
                        warrior.addDragon(type, dragon.id);
                    }, 10)
                }
                else {
                    //player has this dragon, warn
                    let CN = '';
                    for (let el in Dragons) {
                        for (let dragon in Dragons[el]) {
                            if (dragon == type.split(':')[1]) {
                                CN = Dragons[el][dragon]['zh_CN'];
                            }
                        }
                    }
                    let warn = new DWSUI()
                        .title("§1警告")
                        .body(`你已经拥有${CN},确定要继续吗？`)
                        .button("确定")
                        .button("取消");
                    warn.show(player).then((res) => {
                        switch (res.selection) {
                            case 0:
                                //yes
                                //clear the old dragon
                                if (world.getEntity(warrior.dragons[type])) {
                                    world.getEntity(warrior.dragons[type]).remove();
                                }
                                let loc = arg.source.location;
                                let dragon = player.dimension.spawnEntity(type, loc);
                                warrior.dragons[type] = dragon.id;
                                warrior.base.setDynamicProperty('dragons', JSON.parse(warrior.dragons));
                                break;
                        }
                    })
                }
            }
        }
    });
    aEvent.entityDie.subscribe((arg) => {
        //宝贝龙死亡保护
        let uuid = arg.deadEntity.id;
        let type = arg.deadEntity.typeId;
        let players = world.getAllPlayers();
        for (let player of players) {
            let data = JSON.parse(player.getDynamicProperty('dragons') || "{}");
            if (data[type] == uuid) {
                //找到主人
                let cooldown = JSON.parse(player.getDynamicProperty('cooldown') || "{}");
                cooldown[type] = 5;
                player.setDynamicProperty('cooldown', JSON.stringify(cooldown));
                let data = JSON.parse(player.getDynamicProperty('dragon_data_temp') || "{}");
                data[type] = {
                    "health": [0, 20],
                    "energy": [0, 0],
                    "interact": -1
                };
                player.setDynamicProperty('dragon_data_temp', JSON.stringify(data));
                title(player, `§4${getName(type)}§r§c力竭！已召唤回手环，再次召唤需要等待等待5分钟`);
                return;
            }
        }
    })

    system.runInterval(() => {
        //protect dragon
        let players = world.getAllPlayers();
        for (let player of players) {
            let warrior = new Warrior(player);
            warrior.protect();
            warrior.recover();
        }
    }, 200)

    system.runInterval(() => {
        let players = world.getPlayers();
        for (let player of players) {
            let data = JSON.parse(player.getDynamicProperty('cooldown') || "{}");
            for (let type in data) {
                if (data[type] > 0) {
                    data[type] -= 1;
                }
            }
            player.setDynamicProperty('cooldown', JSON.stringify(data));
            //派遣
            let dragon_data = JSON.parse(player.getDynamicProperty('dragon_data_temp') || "{}");
            for (let type in dragon_data) {
                if (dragon_data[type]['interact'] >= 0) dragon_data[type]['interact'] += 1;
            }
            player.setDynamicProperty('dragon_data_temp', JSON.stringify(dragon_data));
        }
    }, 1200)
}

main();