import { world } from "@minecraft/server";


/**
 * 任务
 */
export class Task{
    id;
    constructor(){
        //
    }

    kill(condition, target){
        world.afterEvents.entityDie.subscribe((arg)=>{
            if (arg.damageSource.damagingEntity?.typeId == 'minecraft:player' || arg.damageSource.damagingProjectile?.getComponent('minecraft:projectile').owner.typeId == 'minecraft:player'){
                //player kill this mob
                let player = arg.damageSource.damagingEntity || arg.damageSource.damagingProjectile?.getComponent('minecraft:projectile').owner;
                if(JSON.parse(player.getDynamicProperty('locked')).indexOf(id) < 0){
                    //unlock
                }
            }
        })
    }

    gain(condition, target){
        world.afterEvents;
    }
}