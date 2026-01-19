import { EntityVariantComponent, Player, world } from "@minecraft/server"
import { dragonData } from "../config/dragons";
import { DragonData } from "../interfaces/dragon";

export class Dragon{
    /**
     * rules to cauculate level and energy.
     */
    rules: ((exp: number) => number)[];
    /**
     * the owner's id.
     */
    ownerId: string;
    /**
     * Dragon's type.
     */
    typeId: string;

    constructor(ownerId: string, typeId: string) {
        // Only store these data.
        this.ownerId = ownerId;
        this.typeId = typeId;
        this.rules = dragonData[this.typeId]['rules'];
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
        return (this.base?.getComponent("minecraft:variant") as EntityVariantComponent).value
    }
    get base() {
        return world.getEntity(this.entityId);
    }
    get owner() {
        return world.getEntity(this.ownerId) as Player;
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
        if (current > this.maxEnergy){
            remain = current - this.maxEnergy;
            current = this.maxEnergy;
        }
        this.energy = current;
        return remain;
    }
    reduceEnergy(value: number) {
        let current = this.energy - value;
        let remain = 0;
        if (current < 0){
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
    get level(){
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
    get isExist(){
        let entity = world.getEntity(this.entityId);
        return entity && entity.isValid ? true : false;
    }

    /**
     * Switch the in / out state of this dragon.
     * @returns True if this dragon is out now else false.
     */
    switchState(): boolean{
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
    evolve(forceEvolve=false) {
        //
    }
}