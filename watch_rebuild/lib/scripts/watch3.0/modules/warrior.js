import { world } from "@minecraft/server";
import { Dragon } from "./dragon";
import { dragonData } from "../config/dragons";
import { DragonIdentifierError } from "../errors/dragonError";
import { DragonExistError } from "../errors/warriorError";
import { Watch } from "./watch";
import { ModalFormData } from "@minecraft/server-ui";
import { Backpack } from "./extra";
const defaultData = {
    dragons: {}
};
/**
 * Represents the state of a warrior (player).
 */
export class Warrior {
    constructor(playerId) {
        var _a;
        this.base = world.getEntity(playerId);
        this.watch = new Watch(this.base);
        this.dragonMap = {};
        for (let dragonType in this.data.dragons)
            this.dragonMap[dragonType] = new Dragon(this.base.id, dragonType);
        this.backpack = new Backpack((_a = this.base.getComponent("minecraft:inventory")) === null || _a === void 0 ? void 0 : _a.container);
    }
    /**
     * Player's data.
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
     * Dragons this player had.
     */
    get dragons() {
        let dragonsData = this.data.dragons;
        let dragonList = [];
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
    addDragon(entityId, forceAdd = false) {
        var _a;
        let entity = world.getEntity(entityId);
        if (!entity || !(entity === null || entity === void 0 ? void 0 : entity.isValid))
            return;
        if (entity.typeId in this.data.dragons && !forceAdd)
            throw new DragonExistError(this.base.name, entity.typeId);
        if (!(entity.typeId in dragonData))
            throw new DragonIdentifierError(entity.typeId);
        let defaultAttr = {
            entityId: entity.id,
            exp: 0,
            energy: 0,
            ownerId: this.base.id,
            extra: {
                health: 0,
                maxHealth: 20,
                healthRegenerationRate: 1,
                energyRegenerationRate: 1,
                callOutCoolDown: 0
            }
        };
        let data = Object.assign(defaultAttr, dragonData[entity.typeId]);
        let warriorData = this.data;
        warriorData.dragons[entity.typeId] = data;
        this.data = warriorData;
        (_a = this.getDragon(entity.typeId)) === null || _a === void 0 ? void 0 : _a.saveToStructure();
    }
    /**
     * Spawn and add a dragon to the player.
     * @param typeId Type of target dragon.
     * @param forceAdd Force to add or not.
     */
    addDragonByType(typeId, forceAdd = false) {
        var _a;
        if (!(typeId in dragonData))
            throw new DragonIdentifierError(typeId);
        if (typeId in this.data.dragons && !forceAdd)
            throw new DragonExistError(this.base.name, typeId);
        let entity = this.base.dimension.spawnEntity(typeId, this.base.location);
        (_a = entity.getComponent("minecraft:tameable")) === null || _a === void 0 ? void 0 : _a.tame(this.base);
        entity.triggerEvent("minecraft:on_tame");
        entity.addTag(`owner#${this.base.id}`);
        this.addDragon(entity.id, forceAdd);
    }
    hasDragon(dragonType) {
        return dragonType in this.data.dragons;
    }
    getDragon(dragonType) {
        for (let dragon of this.dragons) {
            if (dragon.typeId == dragonType)
                return dragon;
        }
    }
    removeDragon(dragonType) {
        if (this.hasDragon(dragonType)) {
            let data = this.data;
            delete data.dragons[dragonType];
            this.data = data;
        }
    }
    showExpForm() {
        let dragonNames = [];
        this.dragons.forEach((dragon) => dragonNames.push(dragon.name));
        let expAmount = this.backpack.getItemTotalAmount("dws:exp");
        let form = new ModalFormData();
        form.title("使用经验点");
        form.dropdown("使用于", dragonNames);
        form.slider("使用数量", 1, expAmount);
        form.show(this.base).then((arg) => {
            if (arg.canceled)
                return;
            if (arg.formValues) {
                // FormValue, 0 is dragon and 1 is amount.
                let selected = this.dragons[arg.formValues[0]];
                let amount = arg.formValues[1];
                let remain = selected.addExp(amount * 10) / 10;
                this.backpack.clearItem("dws:exp", remain);
            }
        });
    }
}
//# sourceMappingURL=warrior.js.map