// LiteLoader-AIDS automatic generated
/// <reference path="d:/lllib/dts/helperlib/src/index.d.ts"/> 

var config = new JsonConfigFile('dws/step.json');

function OnJoin(){
    mc.listen('onJoin', (player)=>{
        if(!config.get(player.name)){
            config.set(player.name, 1);
            //the animation for player
            mc.runcmdEx(`camera @a[name="${player.name}"] set minecraft:free pos 74 20 60 facing @a[name="${player.name}"]`)
            mc.runcmdEx('particle dws:shine_light 80 30 56');
            mc.runcmdEx('particle dws:light_array_2 81 15.1 56');
            setTimeout(()=>{
                mc.runcmdEx(`execute as @a[name="${player.name}"] at @s run camera @s set minecraft:free ease 1 linear pos ~~1~`);
                setTimeout(()=>mc.runcmdEx(`camera @a[name="${player.name}"] clear`), 900);
            }, 100)
        }
    })
}

OnJoin();