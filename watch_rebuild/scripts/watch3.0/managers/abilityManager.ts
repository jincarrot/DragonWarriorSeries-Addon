import { Entity } from "@minecraft/server";
import { Ability } from "../modules/ability";
import { Dragon, LivingDragon } from "../modules/dragon";
import { DragonInValidError } from "../errors/dragonError";

export class AbilityManager {
    abilities: Record<number, Ability>;

    constructor() {
        this.abilities = {};
    }

    getById(abilityId: number) {
        return this.abilities[abilityId];
    }

    getFromProjectile(projectile: Entity) {
        let tags = projectile.getTags();
        for (let tag of tags) {
            if (tag.indexOf("projectile#") >= 0) {
                return this.getById(parseInt(tag.split("projectile#")[1].split(":")[0]));
            }
        }
    }

    createAbility(user: Dragon, abilityId: number) {
        if (user.base && user.base.isValid) {
            let ability = new Ability(user as LivingDragon, abilityId);
            this.abilities[ability.id] = ability;
            return ability;
        }
        else throw new DragonInValidError(user.entityId);
    }
}

export const abilityManager = new AbilityManager();