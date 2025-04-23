// LiteLoader-AIDS automatic generated
/// <reference path="d:/lllib/dts/helperlib/src/index.d.ts"/> 

function Cmd(){
    let tpr = mc.newCommand('tpr', "随机传送", PermType.Any);
    tpr.overload([]);
    tpr.setCallback((cmd, ori, out, res) => {
        if (ori.player.blockPos.dim != '主世界'){
            out.error('随机传送的力量似乎在这个维度不起作用……只有主世界拥有这种力量');
            return;
        }
        mc.runcmdEx(`spreadplayers ${ori.player.blockPos.x} ${ori.player.blockPos.z} 100 3000 @a[name="${ori.player.name}"]`);
        let name = ori.player.name;
        let func = setInterval(()=>{
            let player = mc.getPlayer(name);
            if (player){
                let blockPos = player.blockPos;
                if (blockPos){
                    if (blockPos.y != 321){
                        clearInterval(func);
                        let i = 200;
                        while(i > 0){
                            i--;
                            if(mc.getBlock(blockPos)?.isAir){
                                blockPos.y -= 3;
                            }
                            else break;
                        }
                        player.teleport(blockPos);
                    }
                }
            }
        }, 1000)
    });
    tpr.setup();
}
Cmd();