import{ world } from "@minecraft/server"


export function alert(text: string) {
    //向世界输出字符
    world.sendMessage(text);
}
