import { Player, world } from "@minecraft/server"
import { Dragon } from "./dragon";
import { dragonData } from "../config/dragons";

interface WarriorData {
    dragons: Record<string, any>;
}

const defaultData = {
    dragons: {}
}
 
/**
 * Contains a lot of operations of player.
 */
export default class Warrior {
    playerId: string;
    base: Player;

    constructor(playerId: string) {
        this.playerId = playerId;
        this.base = world.getEntity(playerId) as Player;
    }

    /**
     * player's data
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
     * Dragons this player has.
     */
    get dragons(){
        let dragonsData = this.data.dragons;
        let dragonList: Dragon[] = [];
        for (let dragonType in dragonsData) dragonList.push(new Dragon(this.playerId, dragonType));
        return dragonList;
    }

    /**
     * Add a dragon to player.
     * @returns True if this dragon had been added success.
     */
    addDragon(entityId: string, forceAdd=false){
        let entity = world.getEntity(entityId);
        if (!entity) return;
        if (entity.typeId in this.data.dragons && !forceAdd) {
            console.log(`[error] Player ${this.base?.nameTag} already has a dragon ${entity.typeId}!`)
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
        }
        // data that need to store.
        let data = Object.assign(defaultAttr, dragonData[entity.typeId]);
        let warriorData = this.data;
        warriorData.dragons[entity.typeId] = data;
        this.data = warriorData;
        return true;
    }
}
