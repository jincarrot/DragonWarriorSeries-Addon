import { world } from "@minecraft/server";
import { Dragon } from "./dragon";
import { dragonData } from "../config/dragons";
const defaultData = {
    dragons: {}
};
/**
 * Contains a lot of operations of player.
 */
export default class Warrior {
    constructor(playerId) {
        this.playerId = playerId;
        this.base = world.getEntity(playerId);
    }
    /**
     * player's data
     */
    get data() {
        var _a;
        let data = (_a = this.base) === null || _a === void 0 ? void 0 : _a.getDynamicProperty("dws");
        if (!data)
            data = JSON.stringify(defaultData);
        return JSON.parse(data);
    }
    set data(warriorData) {
        var _a;
        let data = JSON.stringify(warriorData);
        (_a = this.base) === null || _a === void 0 ? void 0 : _a.setDynamicProperty("dws", data);
    }
    /**
     * Dragons this player has.
     */
    get dragons() {
        let dragonsData = this.data.dragons;
        let dragonList = [];
        for (let dragonType in dragonsData)
            dragonList.push(new Dragon(this.playerId, dragonType));
        return dragonList;
    }
    /**
     * Add a dragon to player.
     * @returns True if this dragon had been added success.
     */
    addDragon(entityId, forceAdd = false) {
        var _a;
        let entity = world.getEntity(entityId);
        if (!entity)
            return;
        if (entity.typeId in this.data.dragons && !forceAdd) {
            console.log(`[error] Player ${(_a = this.base) === null || _a === void 0 ? void 0 : _a.nameTag} already has a dragon ${entity.typeId}!`);
            return false;
        }
        if (!(entity.typeId in dragonData)) {
            console.log(`[error] entity ${entity.typeId} is not a dragon.`);
            return false;
        }
        let defaultAttr = {
            entityId: entity.id,
            exp: 0,
            energy: 0,
            ownerId: this.base.id
        };
        // data that need to store.
        let data = Object.assign(defaultAttr, dragonData[entity.typeId]);
        let warriorData = this.data;
        warriorData.dragons[entity.typeId] = data;
        this.data = warriorData;
        return true;
    }
}
//# sourceMappingURL=warrior.js.map