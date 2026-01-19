import { Player, world } from "@minecraft/server"
import { Dragon } from "./dragon";
import { dragonData } from "../config/dragons";
import { DragonIdentifierError } from "../errors/dragonError"
import { DragonExistError } from "../errors/warriorError"
import { WarriorData } from "../interfaces/warrior";

const defaultData = {
    dragons: {}
}

/**
 * Represents the state of a warrior (player).
 */
export class Warrior {
    playerId: string;
    base: Player;

    constructor(playerId: string) {
        this.playerId = playerId;
        this.base = world.getEntity(playerId) as Player;
    }

    /**
     * Player's data.
     */
    get data(): WarriorData {
        let data = this.base?.getDynamicProperty("dws") as string;
        if (!data) data = JSON.stringify(defaultData);
        return JSON.parse(data) as WarriorData;
    }
    set data(warriorData: WarriorData) {
        let data = JSON.stringify(warriorData);
        this.base?.setDynamicProperty("dws", data);
    }

    /**
     * Dragons this player had.
     */
    get dragons(){
        let dragonsData = this.data.dragons;
        let dragonList: Dragon[] = [];
        for (let dragonType in dragonsData) 
            dragonList.push(new Dragon(this.playerId, dragonType));
        return dragonList;
    }

    /**
     * Add a dragon to the player.
     */
    addDragon(entityId: string, forceAdd=false){
        let entity = world.getEntity(entityId);
        if (!entity || !entity?.isValid) return;
        if (entity.typeId in this.data.dragons && !forceAdd)
            throw new DragonExistError(this.base.name, entity.typeId);
        if (!(entity.typeId in dragonData)) 
            throw new DragonIdentifierError(entity.typeId);
        let defaultAttr = {
            entityId: entity.id, 
            exp: 0, 
            energy: 0, 
            ownerId: this.base.id
        }
        let data = Object.assign(defaultAttr, dragonData[entity.typeId]);
        let warriorData = this.data;
        warriorData.dragons[entity.typeId] = data;
        this.data = warriorData;
    }
    hasDragon(dragonType: string) {
        return dragonType in this.data.dragons;
    }
    removeDragon(dragonType: string) {
        if (this.hasDragon(dragonType)) {
            let data = this.data;
            delete data.dragons[dragonType];
            this.data = data;
        }
    }
}
