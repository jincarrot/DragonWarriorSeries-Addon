import { Entity } from "@minecraft/server";
import { Ability } from "../modules/ability";

class AbilityManager{
    abilities: Record<number, Ability>;

    constructor() {
        this.abilities = {};
    }
    getById(abilityId: number){
        return this.abilities[abilityId];
    }

    getFromProjectile(projectile: Entity) {
        let tags = projectile.getTags();
        for (let tag in tags) {
            if (tag.indexOf("projectile#") >= 0){
                return this.getById(parseInt(tag.split("projectile#")[1].split(":")[0]));
            }
        }
    }

    createAbility(){}
}

export const abilityManager = new AbilityManager();