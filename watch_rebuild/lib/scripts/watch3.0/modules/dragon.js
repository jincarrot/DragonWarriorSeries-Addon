import { world } from "@minecraft/server";
import { dragonData } from "../config/dragons";
import { abilityManager } from "../managers/abilityManager";
export class Dragon {
    constructor(ownerId, typeId) {
        // Only store these data.
        this.ownerId = ownerId;
        this.typeId = typeId;
        this.rules = dragonData[this.typeId]['rules'];
    }
    get data() {
        let data = JSON.parse(this.owner.getDynamicProperty("dws"));
        return data['dragons'][this.typeId];
    }
    setData(key, value) {
        let data = JSON.parse(this.owner.getDynamicProperty("dws"));
        data['dragons'][this.typeId][key] = value;
        this.owner.setDynamicProperty("dws", JSON.stringify(data));
    }
    /**
     * Chinese name or custom name tag of this dragon.
     */
    get name() {
        var _a, _b;
        return (this.isExist ? (((_a = this.base) === null || _a === void 0 ? void 0 : _a.nameTag) ? (_b = this.base) === null || _b === void 0 ? void 0 : _b.nameTag : this.data.name) : this.data.name);
    }
    set name(value) {
        var _a;
        if (this.isExist && ((_a = this.base) === null || _a === void 0 ? void 0 : _a.nameTag)) {
            this.base.nameTag = value;
        }
        this.setData("name", value);
    }
    /**
     * Current stage of this dragon, that is, evovled times.
     */
    get stage() {
        var _a;
        return ((_a = this.base) === null || _a === void 0 ? void 0 : _a.getComponent("minecraft:variant")).value;
    }
    get base() {
        return world.getEntity(this.entityId);
    }
    get owner() {
        return world.getEntity(this.ownerId);
    }
    get entityId() {
        return this.data.entityId;
    }
    set entityId(value) {
        this.setData("entityId", value);
    }
    /**
     * Abilities this dragon has, stores ability's ids.
     */
    get abilities() {
        return this.data.abilities;
    }
    set abilities(value) {
        this.setData("abilities", value);
    }
    addAbility(abilityId) {
        if (!this.hasAbility(abilityId)) {
            let abilities = this.abilities;
            abilities.push(abilityId);
            this.abilities = abilities;
        }
    }
    hasAbility(abilityId) {
        return abilityId in this.abilities;
    }
    removeAbility(abilityId) {
        if (this.hasAbility(abilityId)) {
            let abilities = this.abilities;
            abilities.splice(abilities.indexOf(abilityId), 1);
            this.abilities = abilities;
        }
    }
    useAbility(abilityId) {
        if (this.hasAbility(abilityId)) {
            let ability = abilityManager.createAbility(this, abilityId);
            return ability;
        }
    }
    /**
     * current energy of this dragon.
     */
    get energy() {
        return this.data.energy;
    }
    set energy(value) {
        this.setData("energy", value);
    }
    addEnergy(value) {
        let current = this.energy + value;
        let remain = 0;
        if (current > this.maxEnergy) {
            remain = current - this.maxEnergy;
            current = this.maxEnergy;
        }
        this.energy = current;
        return remain;
    }
    reduceEnergy(value) {
        let current = this.energy - value;
        let remain = 0;
        if (current < 0) {
            remain = -current;
            current = 0;
        }
        this.energy = current;
        return remain;
    }
    /**
     * max energy of this dragon.
     */
    get maxEnergy() {
        let energyRule = this.rules[1];
        return energyRule(this.exp);
    }
    /**
     * Dragon's attributes, a list.
     */
    get attributes() {
        return this.data.attributes;
    }
    set attributes(value) {
        this.setData("attributes", value);
    }
    /**
     * Add a attribute.
     * @param attrType Attribute to add.
     */
    addAttribute(attrType) {
        if (!this.hasAttribute(attrType)) {
            let attrs = this.attributes;
            attrs.push(attrType);
            this.attributes = attrs;
        }
    }
    hasAttribute(attrType) {
        return attrType in this.attributes;
    }
    removeAttribute(attrType) {
        if (this.hasAttribute(attrType)) {
            let attrs = this.attributes;
            attrs.splice(attrs.indexOf(attrType), 1);
            this.attributes = attrs;
        }
    }
    get exp() {
        return this.data.exp;
    }
    set exp(value) {
        this.setData("exp", value);
    }
    get maxExp() {
        return this.data.maxExp;
    }
    /**
     * Add exp to this dragon.
     * @param value exp to add.
     * @returns Remains amount.
     */
    addExp(value) {
        let current = this.exp + value;
        let remain = 0;
        if (current > this.maxExp) {
            remain = current - this.maxExp;
            current = this.maxExp;
        }
        this.exp = current;
        return remain;
    }
    /**
     * Reduce exp from this dragon.
     * @param value exp to reduce.
     * @returns Remains amount.
     */
    reduceExp(value) {
        let current = this.exp - value;
        let remain = 0;
        if (current < 0) {
            remain = -current;
            current = 0;
        }
        this.exp = current;
        return remain;
    }
    /**
     * current level of this dragon.
     */
    get level() {
        let levelRule = this.rules[0];
        return levelRule(this.exp);
    }
    /**
     * max level of this dragon.
     */
    get maxLevel() {
        return this.rules[0](this.data.maxExp);
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
        var _a, _b, _c, _d;
        if (this.isExist) {
            // call in
            (_a = this.base) === null || _a === void 0 ? void 0 : _a.teleport({ x: this.base.location.x, y: this.base.location.y + 10, z: this.base.location.z });
            let loc = (_b = this.base) === null || _b === void 0 ? void 0 : _b.location;
            (_c = this.base) === null || _c === void 0 ? void 0 : _c.runCommand(`structure save "${this.owner.name}_${this.typeId}" ${loc === null || loc === void 0 ? void 0 : loc.x} ${loc === null || loc === void 0 ? void 0 : loc.y} ${loc === null || loc === void 0 ? void 0 : loc.z} ${loc === null || loc === void 0 ? void 0 : loc.x} ${loc === null || loc === void 0 ? void 0 : loc.y} ${loc === null || loc === void 0 ? void 0 : loc.z} true disk`);
            (_d = this.base) === null || _d === void 0 ? void 0 : _d.remove();
            return false;
        }
        // call out
        let loc = this.owner.location;
        this.owner.runCommand(`structure load "${this.owner.name}_${this.typeId}" ${loc.x} ${loc.y + 1} ${loc.z}`);
        let dragons = this.owner.dimension.getEntities({ type: this.typeId });
        dragons.forEach((dragon) => {
            for (let tag of dragon.getTags()) {
                if (tag.indexOf("owner#") >= 0) {
                    if (tag.replace("owner#", "") == this.ownerId)
                        this.entityId = dragon.id;
                    break;
                }
            }
        });
        return true;
    }
    /**
     * Evolve this dragon.
     */
    evolve(forceEvolve = false) {
        //
    }
    getInfo() {
        return `等级：${this.level} / ${this.maxLevel} \n`;
    }
}
export class LivingDragon extends Dragon {
    get base() { return world.getEntity(this.entityId); }
}
//# sourceMappingURL=dragon.js.map