// LiteLoader-AIDS automatic generated
/// <reference path="d:/lllib/dts/helperlib/src/index.d.ts"/> 

//跨服传送-dws-main

let config = new JsonConfigFile('../dws/player.json');

function Cmd(){
    let transfer = mc.newCommand('trans', '将自己传送至另一个dws服务器', PermType.GameMasters);
    transfer.mandatory('op', ParamType.Enum, 'op', 1);
    transfer.setEnum('op', ['temp', 'forever', 'test']);
    transfer.overload(['op']);
    transfer.setCallback((cmd, ori, out, res) => {
        if (!ori.player){
            out.error('必须由玩家使用该命令！');
            return;
        }
        else {
            if (res['op'] == 'test'){
                if(!'world' in dProperty.toObject()['2a2f42bd-98d4-4e0d-8e3f-934ab8a0c05e'])return;
            }
            let player = ori.player;
            let Nbt = player.getNbt();
            let dProperty = Nbt.getTag('DynamicProperties');
            let dws = dProperty ? dProperty.toObject()['2a2f42bd-98d4-4e0d-8e3f-934ab8a0c05e'] : null;
            let data = {
                'dws': dws,
                'tag': res['op']
            };
            config.set(player.name, data);
            player.transServer('203.135.99.51', 10130);
            //物品传输
            let db = new KVDatabase('../dws/inventory');
            db.set(player.name, player.getNbt().toSNBT());
            db.close();
        }
    });
    transfer.setup();
}

function onJoin(){
    mc.listen('onJoin', (player) => {
        config = new JsonConfigFile('../dws/player.json');
        let data = config.get(player.realName);
        if (data){
            let nbt = player.getNbt();
            let dws = new NbtCompound({
                'dragons': new NbtString(data['dws']['dragons']),
                'dragon_data_temp': new NbtString(data['dws']['dragon_data_temp'])
            })
            nbt.setTag('DynamicProperties', nbt.getData('DynamicProperties').setTag('2a2f42bd-98d4-4e0d-8e3f-934ab8a0c05e', dws));
            config.delete(player.name);
            //物品加载
            let db = new KVDatabase('../dws/inventory');
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
        }
    })
}

function main(){
    Cmd();
    onJoin();
}

main();