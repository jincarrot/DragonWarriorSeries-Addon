import { Entity, EntityVariantComponent, Player, system, world } from "@minecraft/server"
import { dragonData } from "../config/dragons";
import { DragonData } from "../interfaces/dragon";
import { abilityManager } from "../managers/abilityManager";
import { getClosestEnermy, isAbility, sendInfo } from "../utils/game";
import { AbilityIdentifierError, AbilityInValidError } from "../errors/abilityError";
import { ABILITIES } from "../config/abilities";
import { DragonCallOutCoolDownError, DragonInValidError } from "../errors/dragonError";
import { AbilityUseConditionType } from "../enums/ability";
import { alert } from "../utils/debug";

export class Dragon {
    /**
     * rules to cauculate level and energy.
     */
    readonly rules: ((exp: number) => number)[];
    /**
     * the owner's id.
     */
    readonly ownerId: string;
    /**
     * Dragon's type.
     */
    readonly typeId: string;
    private readonly timerId: number;

    constructor(ownerId: string, typeId: string) {
        // Only store these data.
        this.ownerId = ownerId;
        this.typeId = typeId;
        this.rules = dragonData[this.typeId]['rules'];

        this.timerId = system.runInterval(() => this.regenerate(), 60);
    }

    destory() {
        system.clearRun(this.timerId);
    }

    private regenerate() {
        if (this.callOutCoolDown > 0) {
            this.callOutCoolDown -= 60;
            if (this.callOutCoolDown < 0) this.callOutCoolDown = 0;
        }
        this.health += this.data.extra.healthRegenerationRate || 1;
        this.addEnergy(this.data.extra.energyRegenerationRate || 1);
    }

    get data(): DragonData {
        let data = JSON.parse(this.owner.getDynamicProperty("dws") as string) as any;
        return data['dragons'][this.typeId];
    }
    private setData(key: any, value: any) {
        let data = JSON.parse(this.owner.getDynamicProperty("dws") as string) as any;
        data['dragons'][this.typeId][key] = value;
        this.owner.setDynamicProperty("dws", JSON.stringify(data));
    }

    /**
     * Chinese name or custom name tag of this dragon.
     */
    get name() {
        return (this.isExist ? (this.base?.nameTag ? this.base?.nameTag : this.data.name) : this.data.name);
    }
    set name(value: string) {
        if (this.isExist && this.base?.nameTag) {
            this.base.nameTag = value;
        }
        this.setData("name", value);
    }
    /**
     * Current stage of this dragon, that is, evovled times.
     */
    get stage() {
        return this.isExist ? (this.base?.getProperty("dws:evolved") ? 1 : 0) : 0;
    }
    get base() {
        return world.getEntity(this.entityId);
    }
    get owner() {
        return world.getEntity(this.ownerId) as Player;
    }
    get evolutionPermission() {
        return this.data.skills.enableEvolve;
    }
    set evolutionPermission(value: boolean) {
        let skills = this.data.skills;
        skills.enableAbility = value;
        this.setData("skills", skills);
    }
    get callOutCoolDown() {
        return this.data.extra.callOutCoolDown;
    }
    set callOutCoolDown(value: number) {
        let extra = this.data.extra;
        extra.callOutCoolDown = value;
        this.setData("extra", extra);
    }

    get health() {
        if (this.isExist)
            return (this.base as Entity).getComponent("minecraft:health")?.currentValue as number;
        else return this.data.extra.health;
    }
    set health(value: number) {
        if (value > this.maxHealth) value = this.maxHealth;
        if (this.isExist) (this.base as Entity).getComponent("minecraft:health")?.setCurrentValue(value);
        else {
            let extra = this.data.extra;
            extra.health = value;
            this.setData("extra", extra);
        }
    }
    get maxHealth() {
        if (this.isExist)
            return (this.base as Entity).getComponent("minecraft:health")?.effectiveMax as number;
        else return this.data.extra.maxHealth;
    }
    private set maxHealth(value: number) {
        let extra = this.data.extra;
        extra.maxHealth = value;
        this.setData("extra", extra);
    }

    get healthRegenerationRate() {
        return this.data.extra.healthRegenerationRate;
    }

    set healthRegenerationRate(value: number) {
        let extra = this.data.extra;
        extra.healthRegenerationRate = value;
        this.setData("extra", extra);
    }

    get energyRenegerationRate() {
        return this.data.extra.energyRegenerationRate;
    }

    set energyRenegerationRate(value: number) {
        let extra = this.data.extra;
        extra.energyRegenerationRate = value;
        this.setData("extra", extra);
    }

    get entityId(): string {
        return this.data.entityId;
    }
    set entityId(value: string) {
        this.setData("entityId", value);
    }

    /**
     * Abilities this dragon has, stores ability's ids.
     */
    get abilities() {
        return this.data.abilities;
    }
    private set abilities(value: number[]) {
        this.setData("abilities", value);
    }
    addAbility(abilityId: number) {
        if (!this.hasAbility(abilityId)) {
            let abilities = this.abilities;
            abilities.push(abilityId);
            this.abilities = abilities
        }
    }
    hasAbility(abilityId: number) {
        return abilityId in this.abilities;
    }
    removeAbility(abilityId: number) {
        if (this.hasAbility(abilityId)) {
            let abilities = this.abilities;
            abilities.splice(abilities.indexOf(abilityId), 1);
            this.abilities = abilities
        }
    }
    useAbility(abilityId: number) {
        if (this.hasAbility(abilityId)) {
            if (!this.base || !this.base.isValid) {
                sendInfo(this.ownerId, `[${this.name}]使用技能[${ABILITIES[abilityId].name}]失败！原因：龙不在世界中`);
                return;
            }
            if (!isAbility(abilityId)) throw new AbilityInValidError(abilityId, this.base?.id as string);
            let useCondition = ABILITIES[abilityId].useCondition;
            if (typeof useCondition == "function")
                if (!useCondition(this)) return;
            if (
                (
                    !useCondition ||
                    (
                        typeof useCondition != "function" &&
                        useCondition.indexOf(AbilityUseConditionType.NeedEnergy) >= 0
                    )
                ) &&
                this.energy < ABILITIES[abilityId].cost
            ) {
                sendInfo(this.ownerId, `[${this.name}]使用技能[${ABILITIES[abilityId].name}]失败！原因：能量不足`);
                return;
            }
            if (
                (
                    !useCondition ||
                    (
                        typeof useCondition != "function" &&
                        useCondition.indexOf(AbilityUseConditionType.NeedEnermy) >= 0
                    )
                ) &&
                !getClosestEnermy(this.base)
            ) {
                sendInfo(this.ownerId, `[${this.name}]使用技能[${ABILITIES[abilityId].name}]失败！原因：未发现敌怪`);
                return;
            }
            let ability = abilityManager.createAbility(this, abilityId);
            this.reduceEnergy(ability.attr.cost);
            return ability;
        }
        throw new AbilityIdentifierError(abilityId);
    }

    /**
     * current energy of this dragon.
     */
    get energy() {
        return this.data.energy;
    }
    private set energy(value: number) {
        this.setData("energy", value);
    }
    addEnergy(value: number) {
        let current = this.energy + value;
        let remain = 0;
        if (current > this.maxEnergy) {
            remain = current - this.maxEnergy;
            current = this.maxEnergy;
        }
        this.energy = current;
        return remain;
    }
    reduceEnergy(value: number) {
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
    set attributes(value: string[]) {
        this.setData("attributes", value);
    }
    /**
     * Add a attribute.
     * @param attrType Attribute to add.
     */
    addAttribute(attrType: string) {
        if (!this.hasAttribute(attrType)) {
            let attrs = this.attributes;
            attrs.push(attrType);
            this.attributes = attrs;
        }
    }
    hasAttribute(attrType: string) {
        return attrType in this.attributes;
    }
    removeAttribute(attrType: string) {
        if (this.hasAttribute(attrType)) {
            let attrs = this.attributes;
            attrs.splice(attrs.indexOf(attrType), 1);
            this.attributes = attrs;
        }
    }

    get exp() {
        return this.data.exp;
    }
    private set exp(value: number) {
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
    addExp(value: number) {
        let levelBefore = this.level;
        let current = this.exp + value;
        let remain = 0;
        if (current > this.maxExp) {
            remain = current - this.maxExp;
            current = this.maxExp;
        }
        this.exp = current;
        if (this.level > levelBefore) this.playUpgradeAnimation(levelBefore);
        return remain;
    }
    /**
     * Reduce exp from this dragon.
     * @param value exp to reduce.
     * @returns Remains amount.
     */
    reduceExp(value: number) {
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
    private playUpgradeAnimation(levelBefore: number) {
        this.energy = this.maxEnergy;
        sendInfo(this.ownerId, `${this.name}从${levelBefore}级升级至${this.level}级！`);
        for (let l = (levelBefore || 1); l < this.level; l++) this.base?.triggerEvent(`dws:lv${l}_${l + 1}`);
        if (this.isExist) {
            // animation
        }
    }

    /**
     * Returns true if this dragon exist in the world.
     */
    get isExist() {
        let entity = world.getEntity(this.entityId);
        return entity && entity.isValid ? true : false;
    }

    get canEvolve() {
        return this.isExist && this.evolutionPermission && this.energy > 50;
    }

    /**
     * Save this dragon's data to structure.
     */
    saveToStructure() {
        if (!this.isExist) return;
        this.base?.teleport({ x: this.base.location.x, y: this.base.location.y + 10, z: this.base.location.z });
        let loc = this.base?.location;
        this.base?.runCommand(`structure save "${this.owner.name}_${this.typeId}" ${loc?.x} ${loc?.y} ${loc?.z} ${loc?.x} ${loc?.y} ${loc?.z} true disk`);
        this.base?.teleport({ x: this.base.location.x, y: this.base.location.y - 9, z: this.base.location.z });
    }

    applyData() {
        if (!this.isExist) return;
        for (let level = 1; level < this.level; level++) this.base?.triggerEvent(`dws:lv${level}_${level + 1}`);
        if (this.data.extra.health > 0) this.health = this.data.extra.health;
    }

    /**
     * Switch the in / out state of this dragon.
     * @returns True if this dragon is out now else false.
     */
    switchState(): boolean {
        if (this.callOutCoolDown) {
            sendInfo(this.ownerId, `[${this.name}]召唤冷却中，剩余时间：${this.callOutCoolDown / 20}s`);
            return this.isExist;
        }
        if (this.isExist) {
            // call in
            this.back();
            system.runTimeout(() => {
                let health = this.base?.getComponent("minecraft:health");
                let currentValue = health?.currentValue || 0;
                let maxValue = health?.effectiveMax || 0;
                this.saveToStructure();
                this.base?.remove();
                this.health = currentValue;
                this.maxHealth = maxValue;
            }, 1);
            return false;
        }
        // call out
        let loc = this.owner.location;
        this.owner.runCommand(`structure load "${this.owner.name}_${this.typeId}" ${loc.x} ${loc.y + 1} ${loc.z}`);
        // Get the new dragon and apply its entity id to instance's id.
        let dragons = this.owner.dimension.getEntities({ type: this.typeId });
        dragons.forEach((dragon) => {
            for (let tag of dragon.getTags()) {
                if (tag.indexOf("owner#") >= 0) {
                    if (tag.replace("owner#", "") == this.ownerId) this.entityId = dragon.id;
                    break;
                }
            }
        });
        this.applyData();
        return true;
    }

    /**
     * Evolve this dragon.
     */
    evolve(forceEvolve = false) {
        if (this.canEvolve || forceEvolve)
            this.base?.triggerEvent("dws:evolve");
    }

    back() {
        if (this.isExist && this.stage) {
            let health = this.health;
            this.base?.triggerEvent("dws:back");
            this.applyData();
            this.health = health;
        }
    }

    getInfo() {
        let stateInfo = `状态: ${this.isExist ? "已召唤" : (this.callOutCoolDown ? `召唤冷却： ${this.callOutCoolDown / 20}s` : "召回")}\n`;
        let healthInfo = `生命值: ${this.health} / ${this.maxHealth}\n`;
        let levelInfo = `等级: ${this.level} / ${this.maxLevel} \n`;
        let energyInfo = `能量: ${this.energy} / ${this.maxEnergy}\n`;
        let expInfo = `总经验: ${this.exp}\n`;
        return stateInfo + healthInfo + levelInfo + energyInfo + expInfo;
    }
}

export class LivingDragon extends Dragon {
    get base() { return world.getEntity(this.entityId) as Entity; }
}