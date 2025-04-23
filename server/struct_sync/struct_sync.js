// LiteLoader-AIDS automatic generated
/// <reference path="d:/lllib/dts/helperlib/src/index.d.ts"/> 

//结构同步

let DragonId = ["kavili", "semela", "gabina", "reguman", "giardo", "sori", "darigu", "hynas"];

function OnScoreChange() {
    mc.listen('onScoreChanged', (player, num) => {
        if (num == 0) return;
        let db = new KVDatabase('../dws/structures');
        if (num > 0) {
            //召回
            let type = DragonId[num - 1];
            let id = JSON.parse(String(JSON.parse(player.getNbt().getTag('DynamicProperties').toString())['2a2f42bd-98d4-4e0d-8e3f-934ab8a0c05e']['dragons']))[`dws:${type}`]
            let mob = mc.getEntity(Number(id));
            let nbt = mc.getStructure(mob.blockPos, mob.blockPos, true, false);
            nbt.setTag('structure', nbt.getData('structure').setTag("entities", new NbtList([mob.getNbt().setTag('internalComponents', new NbtCompound({}))])));
            db.set(`${player.name}_${mob.type}`, nbt.toSNBT());
        }
        else {
            //召唤  
            num = -num;
            let x = num.toString()[0] - 4;
            let z = num.toString()[2] - 4;
            let typeId = num.toString().split('1000')[1];
            let pos = new IntPos(player.blockPos.x + x, player.blockPos.y, player.blockPos.z + z, player.blockPos.dimid);
            mc.setStructure(NBT.parseSNBT(db.get(`${player.name}_dws:${DragonId[typeId]}`)), pos);
        }
        db.close();
        player.setScore('dws', 0);
    })
}

function main() {
    OnScoreChange();
}

main();