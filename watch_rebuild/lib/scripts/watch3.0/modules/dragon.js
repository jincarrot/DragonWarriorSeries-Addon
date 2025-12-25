import { world } from "@minecraft/server";
import { dragonData } from "../config/dragons";
export class Dragon {
    constructor(ownerId, typeId) {
        // Only store these data.
        this.ownerId = ownerId;
        this.typeId = typeId;
        this.rules = dragonData[this.typeId]['rules'];
    }
    /**
     * Current stage of this dragon, that is, evovled times.
     */
    get state() {
        var _a;
        return ((_a = this.base) === null || _a === void 0 ? void 0 : _a.getComponent("minecraft:variant")).value;
    }
    get data() {
        let data = JSON.parse(this.owner.getDynamicProperty("dws"));
        return data['dragons'][this.typeId];
    }
    get entityId() {
        return this.data.entityId;
    }
    /**
     * Abilities this dragon has, stores ability's ids.
     */
    get abilities() {
        return this.data.abilities;
    }
    /**
     * max level of this dragon.
     */
    get maxLevel() {
        return this.data.maxLevel;
    }
    /**
     * current energy of this dragon.
     */
    get energy() {
        return this.data.energy;
    }
    /**
     * Dragon's attributes, a list.
     */
    get attributes() {
        return this.data.attributes;
    }
    get base() {
        return world.getEntity(this.entityId);
    }
    get exp() {
        return this.data.exp;
    }
    set exp(value) {
        this.setData("exp", value);
    }
    get owner() {
        return world.getEntity(this.ownerId);
    }
    /**
     * current level of this dragon.
     */
    get level() {
        let levelRule = this.rules[0];
        return levelRule(this.exp);
    }
    /**
     * max energy of this dragon.
     */
    get maxEnergy() {
        let energyRule = this.rules[1];
        return energyRule(this.exp);
    }
    /**
     * Returns true if this dragon exist in the world.
     */
    get isExist() {
        let entity = world.getEntity(this.entityId);
        return entity && entity.isValid ? true : false;
    }
    /**
     * Switch the in / out state of this dragon.
     * @returns True if this dragon is out now else false.
     */
    switchState() {
        if (this.isExist) {
            // call in
            return false;
        }
        // call out
        return true;
    }
    /**
     * Evolve this dragon.
     */
    evolve(forceEvolve = false) {
        //
    }
    setData(key, value) {
        let data = JSON.parse(this.owner.getDynamicProperty("dws"));
        data['dragons'][this.typeId][key] = value;
        this.owner.setDynamicProperty("dws", JSON.stringify(data));
    }
}
//# sourceMappingURL=dragon.js.map