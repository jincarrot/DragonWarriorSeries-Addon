import { Container, Player, world } from "@minecraft/server"
import { Dragon } from "./dragon";
import { dragonData } from "../config/dragons";
import { DragonIdentifierError } from "../errors/dragonError"
import { DragonExistError } from "../errors/warriorError"
import { WarriorData } from "../interfaces/warrior";
import { Watch } from "./watch";
import { ModalFormData } from "@minecraft/server-ui";
import { Backpack } from "./extra";
import { DragonAttr } from "../interfaces/dragon";

const defaultData: WarriorData = {
    dragons: {}
}

/**
 * Represents the state of a warrior (player).
 */
export class Warrior {
    readonly base: Player;
    readonly watch: Watch;
    private dragonMap: Record<string, Dragon>;
    readonly backpack: Backpack;

    constructor(playerId: string) {
        this.base = world.getEntity(playerId) as Player;
        this.watch = new Watch(this.base);
        this.dragonMap = {};
        for (let dragonType in this.data.dragons) this.dragonMap[dragonType] = new Dragon(this.base.id, dragonType);
        this.backpack = new Backpack(this.base.getComponent("minecraft:inventory")?.container as Container);
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
    get dragons() {
        let dragonsData = this.data.dragons;
        let dragonList: Dragon[] = [];
        for (let dragonType in dragonsData) {
            if (!(dragonType in this.dragonMap))
                this.dragonMap[dragonType] = new Dragon(this.base.id, dragonType);
            dragonList.push(this.dragonMap[dragonType]);
        }
        return dragonList;
    }

    /**
     * Add a dragon which is currently exists in the world to the player.
     */
    addDragon(entityId: string, forceAdd = false) {
        let entity = world.getEntity(entityId);
        if (!entity || !entity?.isValid) return;
        if (entity.typeId in this.data.dragons && !forceAdd)
            throw new DragonExistError(this.base.name, entity.typeId);
        if (!(entity.typeId in dragonData))
            throw new DragonIdentifierError(entity.typeId);
        let defaultAttr: DragonAttr = {
            entityId: entity.id,
            exp: 0,
            energy: 0,
            ownerId: this.base.id,
            stage: 0,
            extra: {
                health: 0,
                maxHealth: 20,
                healthRegenerationRate: 1,
                energyRegenerationRate: 1,
                callOutCoolDown: 0
            },
            skills: {
                enableAbility: false,
                enableCombine: false,
                enableEvolve: true
            }
        }
        let data = Object.assign(defaultAttr, dragonData[entity.typeId]);
        let warriorData = this.data;
        warriorData.dragons[entity.typeId] = data;
        this.data = warriorData;
        this.getDragon(entity.typeId)?.saveToStructure();
    }
    /**
     * Spawn and add a dragon to the player.
     * @param typeId Type of target dragon.
     * @param forceAdd Force to add or not.
     */
    addDragonByType(typeId: string, forceAdd = false) {
        if (!(typeId in dragonData)) throw new DragonIdentifierError(typeId);
        if (typeId in this.data.dragons && !forceAdd) throw new DragonExistError(this.base.name, typeId);
        let entity = this.base.dimension.spawnEntity(typeId, this.base.location);
        entity.getComponent("minecraft:tameable")?.tame(this.base);
        entity.triggerEvent("minecraft:on_tame");
        entity.addTag(`owner#${this.base.id}`);
        this.addDragon(entity.id, forceAdd);
    }
    hasDragon(dragonType: string) {
        return dragonType in this.data.dragons;
    }
    getDragon(dragonType: string) {
        for (let dragon of this.dragons) {
            if (dragon.typeId == dragonType) return dragon;
        }
    }
    removeDragon(dragonType: string) {
        if (this.hasDragon(dragonType)) {
            let data = this.data;
            delete data.dragons[dragonType];
            this.data = data;
        }
    }

    showExpForm() {
        let dragonNames: string[] = [];
        this.dragons.forEach((dragon) => dragonNames.push(dragon.name))
        let expAmount = this.backpack.getItemTotalAmount("dws:exp");
        let form = new ModalFormData();
        form.title("使用经验点");
        form.dropdown("使用于", dragonNames);
        form.slider("使用数量", 1, expAmount);
        form.show(this.base).then((arg) => {
            if (arg.canceled) return;
            if (arg.formValues) {
                // FormValue, 0 is dragon and 1 is amount.
                let selected = this.dragons[arg.formValues[0] as number];
                let amount = arg.formValues[1] as number;
                let remain = selected.addExp(amount * 10) / 10;
                this.backpack.clearItem("dws:exp", remain);
            }
        })
    }
}
