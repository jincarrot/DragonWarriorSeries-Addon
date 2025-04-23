// LiteLoader-AIDS automatic generated
/// <reference path="d:/lllib/dts/helperlib/src/index.d.ts"/> 

function OnUseItem() {
    mc.listen('onUseItem', (player, item) => {
        if (item.type == 'minecraft:nether_star') {
            let alert = mc.newSimpleForm();
            alert.setContent('下界之星似乎拥有了一种牵引力量……\n是否跟随这股力量，找寻力量的本源？');
            alert.addButton(Format.Green + '确定');
            alert.addButton(Format.Red + "取消");
            alert.setTitle('提示');
            player.sendForm(alert, (player, id) => {
                if (id == 0) {
                    if (player.clearItem('minecraft:nether_star', 1)) mc.runcmdEx(`execute as @a[name="${player.name}"] at @s run trans temp`);
                    else {
                        player.sendToast('错误', '下界之星被藏起来了吗……');
                    }
                }
            })
        }
    })
}

function onJoin() {
    //进服给钟
    mc.listen('onJoin', (player) => {
        let config = new JsonConfigFile('dws/init.json');
        if (!config.get(player.name)) {
            config.set(player.name, 1);
            player.giveItem('minecraft:clock');
            config.close();
        }
    })
}

function DragonScale() {
    mc.listen('onPlayerPullFishingHook', (player, entity, item) => {
        if (item) {
            player.addMoney(Math.floor(Math.random() * 3));
        }
    })
    mc.listen('onDestroyBlock', (player, block) => {
        if (block.type.indexOf('ore') >= 0) {
            player.addMoney(Math.floor(Math.random() * 3));
        }
    })
    mc.listen('onMobDie', (mob, src, cause) => {
        if (src && src.isPlayer()) {
            src.addMoney(Math.floor(Math.random() * mob.maxHealth / 10));
        }
    })
}

function Cmd() {
    let dwsinfo = mc.newCommand('dwsinfo', '服务器介绍', PermType.Any);
    dwsinfo.overload([]);
    dwsinfo.setCallback((cmd, ori, out, res) => {
        let info = mc.newSimpleForm();
        info.setTitle('服务器介绍');
        info.addButton('敌怪介绍');
        info.addButton('宝贝龙介绍');
        info.addButton('等级加成');
        ori.player?.sendForm(info, (player, id) => {
            let ui = mc.newSimpleForm();
            switch (id) {
                case 0:
                    ui = mc.newSimpleForm();
                    ui.setTitle(`敌怪介绍`)
                    ui.setContent("共有六种僵尸，每种僵尸对应一个属性，各自拥有不同的技能。 \n\
\n\
每种僵尸的掉落物可用于合成斗龙卡与经验点，前者用于释放宝贝龙，后者用于升级宝贝龙。\n\
\n\
§4“不要让他着火。”")
                    player.sendForm(ui);
                    break;
                case 1:
                    ui = mc.newSimpleForm();
                    ui.setTitle('宝贝龙介绍')
                    ui.setContent("宝贝龙目前制作有一代部分（海纳斯等）与三代（雷古曼等）。\n\
目前一代没有制作功能，以下部分为三代介绍：\n\
\n\
使用属性僵尸掉落的能量与核心合成斗龙卡，使用能量合成经验点。\n\
\n\
斗龙卡长按（右键）即可放置宝贝龙。经验点与斗龙卡使用方法相同。\n\
\n\
经验点可以为宝贝龙增加经验，经验达到一定值即可升级。\n\
\n\
第一次放置宝贝龙时将自动获得斗龙手环，使用手环即可看到宝贝龙的全部功能。\n\
\n\
如果您重复使用了相同的斗龙卡，系统会提示您是否要继续操作。\n\
注意！§4按下确定则先前宝贝龙的数据被全部覆盖！请谨慎使用！")
                    player.sendForm(ui);
                    break;
                case 2:
                    ui = mc.newSimpleForm();
                    ui.setTitle("等级加成")
                    ui.setContent("等级  生命值  能量值  普攻伤害     功能 \n\
 1     20      0        0             无\n\
 2     60      0        3       能够使用普通攻击\n\
 3     100     30       5        能够使用技能\n\
 4     130     70       8             无\n\
 5     150    100       8       普通伤害带有效果\n\
 6     170    120       8         激活能量阵\n\
 7     190    140       9             无\n\
 8     210    160       9             无\n\
 9     230    180       10            无\n\
 10    150    200       10       获得进化资格")
                    player.sendForm(ui);
                    break;
                default:
                    break;
            }
        })
    })
    dwsinfo.setup();
    let jach = mc.newCommand('jach', 'java成就界面', PermType.Any);
    jach.overload([]);
    jach.setCallback((cmd, ori, out, res) => {
        let oriMode = ori.player.gameMode;
        ori.player.setGameMode(0);
        ori.player.setGameMode(2);
        ori.player.setGameMode(oriMode);
    });
    jach.setup();
    let toast = mc.newCommand('toast', '向玩家发送警告', PermType.GameMasters);
    toast.mandatory('player', ParamType.Player);
    toast.mandatory('content', ParamType.String);
    toast.optional('title', ParamType.String);
    toast.overload(['player', 'content', 'title']);
    toast.setCallback((cmd, ori, out, res) => {
        let players = res['player'];
        let content = res['content'];
        let title = res['title'] || '警告';
        for (let player of players) {
            player.sendToast(title, content);
        }
    });
    toast.setup();
    let getdws = mc.newCommand('getdws', '获取斗龙信息', PermType.GameMasters);
    getdws.overload([]);
    getdws.setCallback((cmd, ori, out, res) => {
        let dwsData = new JsonConfigFile('dws/playerDWSData.json');
        let players = mc.getOnlinePlayers();
        for (let player of players) {
            dwsData.set(player.name, player.getNbt().getTag('DynamicProperties').toObject()['2a2f42bd-98d4-4e0d-8e3f-934ab8a0c05e']);
        }
        dwsData.close();
    });
    getdws.setup();
}

function ExpPool() {
    setInterval(() => {
        let players = mc.getOnlinePlayers();
        for (let player of players) {
            if (-145 < player.pos.x && player.pos.x < -51 && -696 < player.pos.z && player.pos.z < -625) {
                for (let i = 0; i < Math.floor(Math.random() * 60); i++) {
                    let pos = new IntPos(Math.floor(Math.random() * 80) - 145, Math.floor(Math.random() * 15) + 75, Math.floor(Math.random() * 60) - 696, player.pos.dimid);
                    mc.spawnMob('minecraft:experience_orb', pos);
                }
            }
        }

    }, 20000)
}

function SideBar() {
    let state = 0;
    setInterval(() => {
        state = state ? 0 : 1;
        let players = mc.getOnlinePlayers();
        for (let player of players) {
            let dragons = JSON.parse(player.getNbt().getTag('DynamicProperties').toObject()['2a2f42bd-98d4-4e0d-8e3f-934ab8a0c05e']["dragons"]);
            let content = {
                "textures/ui/icon_best3": player.getMoney()
            };
            for (let type in dragons) {
                let mob = mc.getEntity(Number(dragons[type]));
                if (mob) content[`textures/ui/${type.split(":")[1]}.v1${state ? "" : ".png"}`] = state ? Number(mob.getNbt().getTag("DynamicProperties").toObject()["2a2f42bd-98d4-4e0d-8e3f-934ab8a0c05e"]["energy0"]) : mob.health;
            }
            player.removeSidebar();
            player.setSidebar('星龙圣域', content);
        }
    }, 5000)
}

function main() {
    OnUseItem();
    onJoin();
    DragonScale();
    Cmd();
}

main();