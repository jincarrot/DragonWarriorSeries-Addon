// LiteLoader-AIDS automatic generated
/// <reference path="d:/lllib/dts/helperlib/src/index.d.ts"/> 

//跨服传送-dws-sub

let config = new JsonConfigFile('../dws/player.json');

function Cmd(){
    let transfer = mc.newCommand('trans', '将自己传送至另一个dws服务器', PermType.GameMasters);
    transfer.overload([]);
    transfer.setCallback((cmd, ori, out, res) => {
        if (!ori.player){
            out.error('必须由玩家使用该命令！');
            return;
        }
        else {
            let player = ori.player;
            let Nbt = player.getNbt();
            let data = {
                'dws': Nbt.getTag('DynamicProperties').toObject()['2a2f42bd-98d4-4e0d-8e3f-934ab8a0c05e']
            };
            config.set(player.name, data);
            player.transServer('203.135.99.51', 10036);
            let db = new KVDatabase('../dws/inventory');
            db.set(player.name, player.getNbt().toSNBT());
            db.close();
        }
    });
    transfer.setup();
}

function onJoin(){
    mc.listen('onJoin', (player) => {
        config = new JsonConfigFile('../dws/player.json')
        let data = config.get(player.realName);
        if (data && 'tag' in data){
            let nbt = player.getNbt();
            let dws = new NbtCompound({
                'dragons': new NbtString(data['dws']['dragons']),
                'dragon_data_temp': new NbtString(data['dws']['dragon_data_temp'])
            })
            nbt.setTag('DynamicProperties', nbt.getData('DynamicProperties').setTag('2a2f42bd-98d4-4e0d-8e3f-934ab8a0c05e', dws));
            config.delete(player.name);
            //物品加载
            if (db.get(player.name)){
                let inv = NBT.parseSNBT(db.get(player.name)).getData('Inventory');
                let off = NBT.parseSNBT(db.get(player.name)).getData('Offhand');
                let armor = NBT.parseSNBT(db.get(player.name)).getData('Armor');
                nbt.setTag('Inventory', inv)
                nbt.setTag('Offhand', off)
                nbt.setTag('Armor', armor)
                player.refreshItems()
                player.setNbt(nbt);
                db.delete(player.name);
            }
            db.close();
            player.addTag(data['tag'])
        }
        else {
            player.kick('此世界的神秘力量将你推开，你必须借助主世界的力量进入');
        }
    })
}

function onPlayerDie(){
    mc.listen('onPlayerDie', (player, src) => {
        if (player.hasTag('temp') && !player.hasTag('forever')){
            //虚影死亡
            player.removeTag('temp');
            mc.runcmdEx(`execute as @a[name="${player.name}"] at @s run trans`);
        }
    })
}

function main(){
    Cmd();
    onJoin();
    onPlayerDie();
}

main();