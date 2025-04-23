// LiteLoader-AIDS automatic generated
/// <reference path="d:/lllib/dts/helperlib/src/index.d.ts"/> 

function OnServerStart() {
    mc.listen('onServerStarted', () => {
        setInterval(()=>{
            mc.runcmdEx(`effect @e[family=monster] regeneration 10 0 true`);
            mc.runcmdEx('effect @e[family=undead] instant_damage 1 0 true');
            mc.runcmdEx('effect @e[family=monster] strength 10 1 true');
            mc.runcmdEx('effect @e[family=monster] resistance 10 1 true');
            mc.runcmdEx('effect @e[family=dragon] strength 10 2 true');
            mc.runcmdEx('effect @e[family=dragon] resistance 10 2 true');
        }, 10000)
    })
}

function Quit() {
    mc.listen('onLeft', (player) => {
        let config = new JsonConfigFile('../dws/player.json');
        let Nbt = player.getNbt();
        let data = {
            'dws': Nbt.getTag('DynamicProperties').toObject()['2a2f42bd-98d4-4e0d-8e3f-934ab8a0c05e']
        };
        config.set(player.name, data);
        if (player.hasTag('temp') || player.hasTag('forever')) {
            //正常退出
            let db = new KVDatabase('../dws/inventory');
            db.set(player.name, player.getNbt().toSNBT());
            db.close();
            player.removeTag('temp');
            player.removeTag('forever');
        }
    })
}

function onAttack(){
    mc.listen('onAttackEntity', (player, entity) => {
        if (player.getHand().type.indexOf('dws:') != -1){
            //手刀，不惩罚
            entity.hurt(5);
        }
        else {
            entity.hurt(1);
            return false
        }
    })
}

function DragonScale() {
    mc.listen('onPlayerPullFishingHook', (player, entity, item) => {
        if (item) {
            player.addMoney(Math.floor(Math.random() * 6));
        }
    })
    mc.listen('onDestroyBlock', (player, block) => {
        if (block.type.indexOf('ore') >= 0) {
            player.addMoney(Math.floor(Math.random() * 6));
        }
    })
    mc.listen('onMobDie', (mob, src, cause) => {
        if (src && src.isPlayer()) {
            src.addMoney(Math.floor(Math.random() * mob.maxHealth / 5));
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
}

function main() {
    OnServerStart();
    Quit();
    onAttack();
    DragonScale();
    Cmd();
}

main();