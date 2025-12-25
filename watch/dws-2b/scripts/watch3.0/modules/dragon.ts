import { Entity, EntityVariantComponent, Player, world } from "@minecraft/server"
import { dragonData } from "../config/dragons";

interface DragonData {
    entityId: string;
    attributes: string[];
    abilities: number[];
    maxLevel: number;
    energy: number;
    /**
     * exp refresh rules
     * 
     * A list, index 0 is level and 1 is max energy
     */
    rules: ((exp: number) => number)[];
    ownerId: string;
    exp: number;
}

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

    /**
     * Current stage of this dragon, that is, evovled times.
     */
    get state() {
        return (this.base?.getComponent("minecraft:variant") as EntityVariantComponent).value
    }

    get data(): DragonData {
        let data = JSON.parse(this.owner.getDynamicProperty("dws") as string) as any;
        return data['dragons'][this.typeId];
    }

    get entityId(): string {
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

    set exp(value: number) {
        this.setData("exp", value);
    }
    
    get owner() {
        return world.getEntity(this.ownerId) as Player;
    }

    /**
     * current level of this dragon.
     */
    get level(){
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

    private setData(key: any, value: any) {
        let data = JSON.parse(this.owner.getDynamicProperty("dws") as string) as any;
        data['dragons'][this.typeId][key] = value;
        this.owner.setDynamicProperty("dws", JSON.stringify(data));
    }
}