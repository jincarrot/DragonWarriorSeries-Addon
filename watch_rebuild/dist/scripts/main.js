// scripts/main.ts
import { world as world2 } from "@minecraft/server";

// scripts/watch3.0/modules/dragon.ts
import { world } from "@minecraft/server";

// scripts/watch3.0/config/dragons.ts
function defaultLevelRule(exp) {
  return Math.floor(Math.sqrt(exp));
}
function defaultEnergyRule(exp) {
  return Math.floor(Math.sqrt(exp)) * 20;
}
var dragonData = {
  "dws:reguman": {
    maxLevel: 10,
    name: "\u96F7\u53E4\u66FC",
    rules: [defaultLevelRule, defaultEnergyRule],
    attributes: ["fire"],
    abilities: []
  }
};

// scripts/watch3.0/modules/dragon.ts
var Dragon = class {
  constructor(ownerId, typeId) {
    this.ownerId = ownerId;
    this.typeId = typeId;
    this.rules = dragonData[this.typeId]["rules"];
  }
  /**
   * Current stage of this dragon, that is, evovled times.
   */
  get state() {
    return (this.base?.getComponent("minecraft:variant")).value;
  }
  get data() {
    let data = JSON.parse(this.owner.getDynamicProperty("dws"));
    return data["dragons"][this.typeId];
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
      return false;
    }
    return true;
  }
  /**
   * Evolve this dragon.
   */
  evolve(forceEvolve = false) {
  }
  setData(key, value) {
    let data = JSON.parse(this.owner.getDynamicProperty("dws"));
    data["dragons"][this.typeId][key] = value;
    this.owner.setDynamicProperty("dws", JSON.stringify(data));
  }
};

// scripts/main.ts
var aEvents = world2.afterEvents;
aEvents.entityHitEntity.subscribe((arg) => {
  world2.sendMessage(arg.damagingEntity.typeId);
  let temp = new Dragon(arg.damagingEntity.id, "dws:reguman");
});

//# sourceMappingURL=../debug/main.js.map
