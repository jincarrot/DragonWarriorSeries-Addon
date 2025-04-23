import { EquipmentSlot, MolangVariableMap, system, world } from "@minecraft/server"

//dws3 - knive

let aEvent = world.afterEvents;
let bEvent = world.beforeEvents;
let values = ["gold", "tree", "water", "fire", "earth", "light"]
var tick = 0;

function camera(){
    //相机
}

function main(){
    //主函数
    {
        //手刀功能
        aEvent.entityHitEntity.subscribe((arg)=>{
            //检测是否为手刀
            if (arg.damagingEntity.hasComponent("minecraft:equippable")){
                let item = (arg.damagingEntity.getComponent("minecraft:equippable")).getEquipment(EquipmentSlot.Mainhand);
                if (typeof item != "undefined"){
                    for (let value of values){
                        if (item.typeId == `dws:${value}_knive`){
                            //
                        }
                    }
                }
            }
        })
        aEvent.itemStartUse.subscribe((arg)=>{
            //临时使用手刀技能功能
            if (arg.itemStack.typeId == "dws:gold_knive"){
                //金刀
            }
            if (arg.itemStack.typeId == "dws:tree_knive"){
                //木刀
            }
            if (arg.itemStack.typeId == "dws:water_knive"){
                //水刀
            }
            if (arg.itemStack.typeId == "dws:fire_knive"){
                //火刀
            }
            if (arg.itemStack.typeId == "dws:earth_knive"){
                //土刀
            }
            if (arg.itemStack.typeId == "dws:light_knive"){
                //光刀
            }
        })
    }
}

main();