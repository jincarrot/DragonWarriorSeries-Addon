import { Ability } from "../modules/ability";
import { DragonInValidError } from "../errors/dragonError";
export class AbilityManager {
    constructor() {
        this.abilities = {};
    }
    getById(abilityId) {
        return this.abilities[abilityId];
    }
    getFromProjectile(projectile) {
        let tags = projectile.getTags();
        for (let tag of tags) {
            if (tag.indexOf("projectile#") >= 0) {
                return this.getById(parseInt(tag.split("projectile#")[1].split(":")[0]));
            }
        }
    }
    createAbility(user, abilityId) {
        if (user.base && user.base.isValid) {
            let ability = new Ability(user, abilityId);
            this.abilities[ability.id] = ability;
            return ability;
        }
        else
            throw new DragonInValidError(user.entityId);
    }
}
export const abilityManager = new AbilityManager();
//# sourceMappingURL=abilityManager.js.map