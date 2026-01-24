// scripts/main.ts
import { world as world7 } from "@minecraft/server";

// scripts/watch3.0/modules/ability.ts
import { system } from "@minecraft/server";

// scripts/watch3.0/utils/game.ts
import { world } from "@minecraft/server";

// scripts/watch3.0/config/dragons.ts
function defaultLevelRule(exp) {
  return Math.floor(Math.sqrt(exp / 10));
}
function defaultEnergyRule(exp) {
  return Math.floor(Math.sqrt(exp / 10)) * 20;
}
var dragonData = {
  "dws:reguman": {
    maxExp: 1e3,
    name: "\u96F7\u53E4\u66FC",
    rules: [defaultLevelRule, defaultEnergyRule],
    attributes: ["fire"],
    abilities: [0]
  }
};

// scripts/watch3.0/enums/attr.ts
var ElementType = /* @__PURE__ */ ((ElementType2) => {
  ElementType2["Gold"] = "gold";
  ElementType2["Wood"] = "wood";
  ElementType2["Water"] = "water";
  ElementType2["Fire"] = "fire";
  ElementType2["Earth"] = "earth";
  ElementType2["Light"] = "light";
  ElementType2["Void"] = "void";
  return ElementType2;
})(ElementType || {});

// scripts/watch3.0/modules/collisions.ts
var Collision = class {
  constructor(dim) {
    this.dim = dim;
  }
};
var Ray = class extends Collision {
  constructor(origin, direction, distance, dim) {
    super(dim);
    this.origin = origin;
    this.direction = direction;
    this.distance = distance;
  }
  getEntities() {
    let entityRayCasts = this.dim.getEntitiesFromRay(this.origin, this.direction, { "maxDistance": this.distance });
    let entities = [];
    for (let e of entityRayCasts) {
      entities.push(e.entity);
    }
    return entities;
  }
};

// scripts/watch3.0/config/abilities.ts
function normalAbilityCallback(attr) {
  return {
    start: (ability) => {
      ability.spawnProjectile(attr.projectileType, ability.user.base.location, attr.trace ? "trace" /* Trace */ : "simple" /* Simple */);
      if (attr.particles?.initial) {
        let loc = ability.user.base.location;
        for (let particleName of attr.particles.initial)
          ability.user.base.dimension.spawnParticle(particleName, loc);
      }
    },
    projectileCallbacks: {
      hitEntity: (projectile, target) => {
        let ability = manager.ability.getFromProjectile(projectile.base);
        target.applyDamage(attr.damage * (1 + (ability?.user.level || 1) / 10));
        if (attr.effects) for (let effectName in attr.effects) {
          if (effectName == "fire") {
            target.setOnFire(attr.effects[effectName][0] * (1 + (ability?.user.level || 1) / 10));
            continue;
          }
          target.addEffect(effectName, attr.effects[effectName][0], { amplifier: attr.effects[effectName][1] });
        }
        if (attr.particles?.hitEntity) {
          let loc = projectile.base.location;
          for (let particleName of attr.particles.hitEntity)
            projectile.base.dimension.spawnParticle(particleName, loc);
        }
      },
      hitBlock: (projectile, location) => {
        if (attr.particles?.hitBlock) {
          let loc = location;
          for (let particleName of attr.particles.hitBlock)
            projectile.base.dimension.spawnParticle(particleName, loc);
        }
        projectile.base.dimension.createExplosion(location, attr.damage / 5);
      },
      main: (projectile) => {
        if (attr.particles?.runtime) {
          let loc = projectile.base.location;
          for (let particleName of attr.particles.runtime)
            projectile.base.dimension.spawnParticle(particleName, loc);
        }
      }
    }
  };
}
var ABILITIES = {
  0: {
    name: "\u54CD\u96F7\u706B\u7403",
    attributes: ["fire" /* Fire */],
    types: ["offensive" /* Offensive */],
    cost: 30,
    duration: 150,
    projectileAttr: {
      speed: 1,
      range: 2
    },
    callbacks: normalAbilityCallback({
      projectileType: "dws:fire_ball",
      damage: 11,
      effects: {
        "fire": [5, 0]
      }
    })
  },
  1: {
    name: "\u5947\u5F02\u5149\u7EBF",
    attributes: ["wood" /* Wood */],
    types: ["offensive" /* Offensive */],
    cost: 30,
    duration: 150,
    callbacks: {
      start: (ability) => {
        let target = getClosestEnermy(ability.user.base);
        if (!target) return;
        let dir = {
          x: target.location.x - ability.user.base.location.x,
          y: target.location.y - ability.user.base.location.y,
          z: target.location.z - ability.user.base.location.z
        };
        let collision = new Ray(ability.user.base.location, dir, 10, ability.user.base.dimension);
        ability.createDetection(collision);
      },
      detectingCallbacks: {
        main: (box) => {
          for (let entity of box.entities)
            entity.applyDamage(5);
        }
      }
    }
  },
  2: {
    name: "\u70AB\u5149\u7206\u88C2",
    attributes: ["gold" /* Gold */],
    types: ["offensive" /* Offensive */],
    cost: 30,
    duration: 150,
    projectileAttr: {
      speed: 1,
      range: 2
    },
    callbacks: normalAbilityCallback({
      projectileType: "dws:gold_ball",
      damage: 16
    })
  },
  3: {
    name: "\u51BD\u6D77\u98D3\u98CE",
    attributes: ["water" /* Water */],
    types: ["offensive" /* Offensive */],
    cost: 30,
    duration: 150,
    projectileAttr: {
      speed: 1,
      range: 2
    },
    callbacks: normalAbilityCallback({
      projectileType: "dws:water_storm",
      damage: 16
    })
  },
  4: {
    name: "\u5343\u91CC\u8FFD\u6708",
    attributes: ["light" /* Light */],
    types: ["offensive" /* Offensive */],
    cost: 30,
    duration: 150,
    projectileAttr: {
      speed: 1,
      range: 2
    },
    callbacks: normalAbilityCallback({
      projectileType: "dws:moon",
      damage: 16
    })
  }
};

// scripts/watch3.0/utils/game.ts
function getClosestEnermy(entity) {
  let filter = {
    families: [],
    location: entity.location,
    closest: 1
  };
  if (entity.getComponent("minecraft:type_family")?.hasTypeFamily("monster")) {
    filter.families?.push("player");
    filter.families?.push("dragon");
  } else {
    filter.families?.push("monster");
  }
  let targetEntities = entity.dimension.getEntities(filter);
  return targetEntities ? targetEntities[0] : void 0;
}
function dist(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
}
function isDragon(typeId) {
  return typeId in dragonData;
}
function isAbility(abilityId) {
  return abilityId in ABILITIES;
}
function isElement(typeId) {
  return Object.values(ElementType).includes(typeId);
}
function sendInfo(playerId, info) {
  world.getEntity(playerId).sendMessage(info);
}
function tryGetElements(entity) {
  let els = [];
  if (entity.getComponent("minecraft:type_family")) {
    for (let familyType of entity.getComponent("minecraft:type_family")?.getTypeFamilies()) {
      if (isElement(familyType)) els.push(familyType);
    }
  }
  if (!els) els = JSON.parse(entity.getDynamicProperty("elements") || "[]");
  return els;
}

// scripts/watch3.0/modules/projectile.ts
var Projectile = class _Projectile {
  static {
    this._id = 0;
  }
  constructor(entity, attr, callbacks) {
    this.base = entity;
    this.attr = attr;
    this.callbacks = callbacks || {};
    this.id = _Projectile._id++;
    if (!attr.range) attr.range = 1;
    if (!attr.attributes) attr.attributes = [];
    this.base.setDynamicProperty("elements", JSON.stringify(this.attr.attributes));
  }
  destory() {
    this.callbacks.despawn ? this.callbacks.despawn(this) : null;
    this.base && this.base.isValid ? this.base.remove() : null;
  }
  detect() {
    if (!this.base || !this.base.isValid) return;
    let enermy = getClosestEnermy(this.base);
    if (!enermy) return;
    if (dist(enermy.location, this.base.location) <= this.attr.range) {
      if (this.callbacks.hitEntity) this.callbacks.hitEntity(this, enermy);
      this.destory();
      return;
    }
    let b = this.base.dimension.getBlock(this.base.location);
    if (b && !b.isAir) {
      if (this.callbacks.hitBlock) this.callbacks.hitBlock(this, b.location);
      this.destory();
    }
  }
};
var SimpleProjectile = class extends Projectile {
  constructor(entity, attr, direction, callbacks) {
    super(entity, attr, callbacks);
    let target = getClosestEnermy(entity);
    if (!direction) {
      let targetLoc = target.location;
      let ori = entity.location;
      direction = { x: targetLoc.x - ori.x, y: targetLoc.y - ori.y, z: targetLoc.z - ori.z };
    }
    let dist2 = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
    direction = { x: direction.x / dist2, y: direction.y / dist2, z: direction.z / dist2 };
    this.direction = direction;
    this.callbacks.spawn ? this.callbacks.spawn(this) : null;
  }
  main() {
    let dir = {
      x: this.direction.x * this.attr.speed,
      y: this.direction.y * this.attr.speed,
      z: this.direction.z * this.attr.speed
    };
    this.base.applyImpulse(dir);
    if (this.callbacks.main) this.callbacks.main(this);
    this.detect();
  }
};
var TraceProjectile = class extends Projectile {
  constructor(entity, attr, target, callbacks) {
    super(entity, attr, callbacks);
    if (!target) target = getClosestEnermy(entity);
    this.target = target;
    this.callbacks.spawn ? this.callbacks.spawn(this) : null;
  }
  main() {
    if (!this.target || !this.base || !this.target.isValid || !this.base.isValid) return;
    let tarLoc = this.target.location;
    let ori = this.base.location;
    let dir = { x: tarLoc.x - ori.x, y: tarLoc.y - ori.y, z: tarLoc.z - ori.z };
    let dist2 = Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
    if (!dist2) this.destory();
    dir = { x: dir.x / dist2, y: dir.y / dist2, z: dir.z / dist2 };
    dir = {
      x: dir.x * this.attr.speed,
      y: dir.y * this.attr.speed,
      z: dir.z * this.attr.speed
    };
    this.base.applyImpulse(dir);
    if (this.callbacks.main) this.callbacks.main(this);
    this.detect();
  }
};

// scripts/watch3.0/modules/detection.ts
var DetectionBox = class _DetectionBox {
  static {
    this._id = 0;
  }
  /**
   * Entities that in this area.
   */
  get entities() {
    return this._entites;
  }
  constructor(collision, callbacks) {
    this.collision = collision;
    this.callbacks = callbacks || {};
    this.id = _DetectionBox._id++;
    this._entites = [];
    this.callbacks.create ? this.callbacks.create(this) : null;
  }
  main() {
    this.refreshEntities();
    this.callbacks.main ? this.callbacks.main(this) : null;
  }
  refreshEntities() {
    let newEntites = this.collision.getEntities();
    let remove = this._entites.filter((entity) => !newEntites.includes(entity));
    let add = newEntites.filter((entity) => !this._entites.includes(entity));
    this._entites = newEntites;
    remove.forEach((entity) => {
      if (this.callbacks.leave) this.callbacks.leave(this, entity);
    });
    add.forEach((entity) => {
      if (this.callbacks.enter) this.callbacks.enter(this, entity);
    });
  }
  destory() {
    this.callbacks.destory ? this.callbacks.destory(this) : null;
  }
};

// scripts/watch3.0/errors/abilityError.ts
var AbilityProgressError = class extends Error {
  constructor(oldState, newState) {
    let message = `Cannot transform the state of ability from state "${oldState}" to "${newState}".`;
    super(message);
    this.name = "AbilityProgressError";
  }
};
var AbilityIdentifierError = class extends Error {
  constructor(abilityId) {
    let message = `Cannot find ability id ${abilityId}.`;
    super(message);
    this.name = "AbilityIdentifierError";
  }
};
var AbilityInValidError = class extends Error {
  constructor(abilityId, entityId) {
    let message = `Entity ${entityId} doesn't has ability ${abilityId}.`;
    super(message);
    this.name = "AbilityInValidError";
  }
};

// scripts/watch3.0/modules/ability.ts
var Ability = class _Ability {
  static {
    this._id = 0;
  }
  get state() {
    return this._state;
  }
  constructor(user, abilityId) {
    if (!(abilityId in ABILITIES)) throw new AbilityIdentifierError(abilityId);
    this.user = user;
    this.attr = ABILITIES[abilityId];
    this.projectileAttr = ABILITIES[abilityId].projectileAttr || { speed: 1 };
    this.projectiles = [];
    this.detections = [];
    this.callbacks = ABILITIES[abilityId].callbacks;
    this.id = _Ability._id++;
    this.ticks = 0;
    this._state = "running" /* Running */;
    if (this.callbacks.start) this.callbacks.start(this);
    this.runtimeId = system.runInterval(() => this.main(), 2);
    if (!this.projectileAttr.attributes) this.projectileAttr.attributes = this.attr.attributes;
  }
  /**
   * Pause this ability. Use method "resume" to resume ability's running.
   */
  pause() {
    if (this._state != "running" /* Running */) throw new AbilityProgressError(this._state, "pause" /* Pause */);
    this._state = "pause" /* Pause */;
    system.clearRun(this.runtimeId);
    this.callbacks.pause ? this.callbacks.pause(this) : null;
  }
  /**
   * Resume this ability if it was paused.
   */
  resume() {
    if (this._state != "pause" /* Pause */) throw new AbilityProgressError(this._state, "running" /* Running */);
    this._state = "running" /* Running */;
    this.runtimeId = system.runInterval(() => this.main(), 2);
    this.callbacks.resume ? this.callbacks.resume(this) : null;
  }
  /**
   * Stop this ability. Cannot resume again.
   */
  stop() {
    this._state = "stopped" /* Stopped */;
    system.clearRun(this.runtimeId);
    this.callbacks.stop ? this.callbacks.stop(this) : null;
    this.clearAllProjectiles();
    this.clearAllDetections();
  }
  /**
   * Main process of this ability, runs every 2 ticks.
   */
  main() {
    for (let projectile of this.projectiles)
      if (!projectile.base || !projectile.base.isValid) this.projectiles.splice(this.projectiles.indexOf(projectile), 1);
    if (this._state == "running" /* Running */) {
      if (this.callbacks.main) this.callbacks.main(this);
      this.projectiles.forEach((projectile) => {
        projectile.main();
      });
      this.detections.forEach((detection) => {
        detection.main();
      });
      this.ticks += 2;
      if (this.ticks > this.attr.duration) {
        this._state = "finished" /* Finished */;
        system.clearRun(this.runtimeId);
        if (this.callbacks.finish) this.callbacks.finish(this);
      }
    }
  }
  /**
   * Spawn a projectile in a location.
   * @param typeId The identifier of the projectile.
   * @param location The location where the projectile will spawn. 
   * If not specified, it will chose the location of the fist projectile which spawn previously, or the user's location.
   */
  spawnProjectile(typeId, location, traceMode = "simple" /* Simple */) {
    if (!location) location = this.projectiles ? this.projectiles[0].base.location : this.user.base.location;
    let entity = this.user.base.dimension.spawnEntity(typeId, location);
    let projectile = null;
    switch (traceMode) {
      case "trace" /* Trace */:
        projectile = new TraceProjectile(entity, this.projectileAttr, void 0, this.callbacks.projectileCallbacks);
        break;
      case "simple" /* Simple */:
        projectile = new SimpleProjectile(entity, this.projectileAttr, void 0, this.callbacks.projectileCallbacks);
        break;
    }
    entity.addTag(`projectile#${this.id}:${projectile.id}`);
    this.projectiles.push(projectile);
    return projectile;
  }
  /**
   * Get projectile with a specific id.
   * @param projectileId Id of the target projectile.
   */
  getProjectile(projectileId) {
    for (let projectile of this.projectiles) {
      if (projectile.id == projectileId) return projectile;
    }
  }
  /**
   * Returns true if the specified projectile exist, else false.
   * @param projectileId Id of the target projectile.
   */
  hasProjectile(projectileId) {
    return this.getProjectile(projectileId) ? true : false;
  }
  /**
   * Delete a specific projectile.
   * @param projectileId Id of the target projectile.
   */
  deleteProjectile(projectileId) {
    let projectile = this.getProjectile(projectileId);
    if (projectile) {
      projectile.destory();
      this.projectiles.splice(this.projectiles.indexOf(projectile), 1);
    }
  }
  /**
   * Clear all projectiles.
   */
  clearAllProjectiles() {
    for (let projectile of this.projectiles)
      projectile.destory();
    this.projectiles = [];
  }
  /**
   * Create a detection.
   */
  createDetection(collision) {
    let detection = new DetectionBox(collision, this.callbacks.detectingCallbacks);
    this.detections.push(detection);
    return detection;
  }
  /**
   * Get detection with a specified id.
   * @param detectionId Id of the target detection.
   */
  getDetection(detectionId) {
    for (let detection of this.detections) {
      if (detection.id == detectionId) return detection;
    }
  }
  /**
   * Returns true if the specified detection exist, else false.
   * @param detectionId Id of the target detection.
   */
  hasDetection(detectionId) {
    return this.getDetection(detectionId) ? true : false;
  }
  /**
   * Delete a specified detection.
   * @param detectionId Id of the target detection.
   */
  deleteDetection(detectionId) {
    let detection = this.getDetection(detectionId);
    if (detection) {
      detection.destory();
      this.detections.splice(this.detections.indexOf(detection), 1);
    }
  }
  /**
   * Clear all detections.
   */
  clearAllDetections() {
    this.detections = [];
  }
};

// scripts/watch3.0/errors/dragonError.ts
var DragonIdentifierError = class extends Error {
  constructor(identifier) {
    let message = `Type "${identifier}" is not a dragon.`;
    super(message);
    this.name = "DragonIdentfierError";
  }
};
var DragonInValidError = class extends Error {
  constructor(identifier) {
    let message = `EntityId "${identifier}" is not valid in the world.`;
    super(message);
    this.name = "DragonInVaildError";
  }
};

// scripts/watch3.0/managers/abilityManager.ts
var AbilityManager = class {
  constructor() {
    this.abilities = {};
  }
  getById(abilityId) {
    return this.abilities[abilityId];
  }
  getFromProjectile(projectile) {
    let tags = projectile.getTags();
    for (let tag of tags) {
      if (tag.indexOf("projectile#") >= 0) {
        return this.getById(parseInt(tag.split("projectile#")[1].split(":")[0]));
      }
    }
  }
  createAbility(user, abilityId) {
    if (user.base && user.base.isValid) {
      let ability = new Ability(user, abilityId);
      this.abilities[ability.id] = ability;
      return ability;
    } else throw new DragonInValidError(user.entityId);
  }
};
var abilityManager = new AbilityManager();

// scripts/watch3.0/managers/dragonManager.ts
import { system as system4, world as world5 } from "@minecraft/server";

// scripts/watch3.0/managers/warriorManager.ts
import { system as system3, world as world4 } from "@minecraft/server";

// scripts/watch3.0/modules/warrior.ts
import { world as world3 } from "@minecraft/server";

// scripts/watch3.0/modules/dragon.ts
import { system as system2, world as world2 } from "@minecraft/server";
var Dragon = class {
  constructor(ownerId, typeId) {
    this.ownerId = ownerId;
    this.typeId = typeId;
    this.rules = dragonData[this.typeId]["rules"];
    this.timerId = system2.runInterval(() => this.regenerate(), 60);
  }
  destory() {
    system2.clearRun(this.timerId);
  }
  regenerate() {
    if (this.callOutCoolDown > 0) {
      this.callOutCoolDown -= 60;
      if (this.callOutCoolDown < 0) this.callOutCoolDown = 0;
    }
    this.health += this.data.extra.healthRegenerationRate || 1;
    this.addEnergy(this.data.extra.energyRegenerationRate || 1);
  }
  get data() {
    let data = JSON.parse(this.owner.getDynamicProperty("dws"));
    return data["dragons"][this.typeId];
  }
  setData(key, value) {
    let data = JSON.parse(this.owner.getDynamicProperty("dws"));
    data["dragons"][this.typeId][key] = value;
    this.owner.setDynamicProperty("dws", JSON.stringify(data));
  }
  /**
   * Chinese name or custom name tag of this dragon.
   */
  get name() {
    return this.isExist ? this.base?.nameTag ? this.base?.nameTag : this.data.name : this.data.name;
  }
  set name(value) {
    if (this.isExist && this.base?.nameTag) {
      this.base.nameTag = value;
    }
    this.setData("name", value);
  }
  /**
   * Current stage of this dragon, that is, evovled times.
   */
  get stage() {
    return this.isExist ? this.base?.getProperty("dws:evolved") ? 1 : 0 : 0;
  }
  get base() {
    return world2.getEntity(this.entityId);
  }
  get owner() {
    return world2.getEntity(this.ownerId);
  }
  get evolutionPermission() {
    return this.data.skills.enableEvolve;
  }
  set evolutionPermission(value) {
    let skills = this.data.skills;
    skills.enableAbility = value;
    this.setData("skills", skills);
  }
  get callOutCoolDown() {
    return this.data.extra.callOutCoolDown;
  }
  set callOutCoolDown(value) {
    let extra = this.data.extra;
    extra.callOutCoolDown = value;
    this.setData("extra", extra);
  }
  get health() {
    if (this.isExist)
      return this.base.getComponent("minecraft:health")?.currentValue;
    else return this.data.extra.health;
  }
  set health(value) {
    if (value > this.maxHealth) value = this.maxHealth;
    if (this.isExist) this.base.getComponent("minecraft:health")?.setCurrentValue(value);
    else {
      let extra = this.data.extra;
      extra.health = value;
      this.setData("extra", extra);
    }
  }
  get maxHealth() {
    if (this.isExist)
      return this.base.getComponent("minecraft:health")?.effectiveMax;
    else return this.data.extra.maxHealth;
  }
  set maxHealth(value) {
    let extra = this.data.extra;
    extra.maxHealth = value;
    this.setData("extra", extra);
  }
  get healthRegenerationRate() {
    return this.data.extra.healthRegenerationRate;
  }
  set healthRegenerationRate(value) {
    let extra = this.data.extra;
    extra.healthRegenerationRate = value;
    this.setData("extra", extra);
  }
  get energyRenegerationRate() {
    return this.data.extra.energyRegenerationRate;
  }
  set energyRenegerationRate(value) {
    let extra = this.data.extra;
    extra.energyRegenerationRate = value;
    this.setData("extra", extra);
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
      if (!this.base || !this.base.isValid) {
        sendInfo(this.ownerId, `[${this.name}]\u4F7F\u7528\u6280\u80FD[${ABILITIES[abilityId].name}]\u5931\u8D25\uFF01\u539F\u56E0\uFF1A\u9F99\u4E0D\u5728\u4E16\u754C\u4E2D`);
        return;
      }
      if (!isAbility(abilityId)) throw new AbilityInValidError(abilityId, this.base?.id);
      let useCondition = ABILITIES[abilityId].useCondition;
      if (typeof useCondition == "function") {
        if (!useCondition(this)) return;
      }
      if ((!useCondition || typeof useCondition != "function" && useCondition.indexOf(2 /* NeedEnergy */) >= 0) && this.energy < ABILITIES[abilityId].cost) {
        sendInfo(this.ownerId, `[${this.name}]\u4F7F\u7528\u6280\u80FD[${ABILITIES[abilityId].name}]\u5931\u8D25\uFF01\u539F\u56E0\uFF1A\u80FD\u91CF\u4E0D\u8DB3`);
        return;
      }
      if ((!useCondition || typeof useCondition != "function" && useCondition.indexOf(1 /* NeedEnermy */) >= 0) && !getClosestEnermy(this.base)) {
        sendInfo(this.ownerId, `[${this.name}]\u4F7F\u7528\u6280\u80FD[${ABILITIES[abilityId].name}]\u5931\u8D25\uFF01\u539F\u56E0\uFF1A\u672A\u53D1\u73B0\u654C\u602A`);
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
  playUpgradeAnimation(levelBefore) {
    this.energy = this.maxEnergy;
    sendInfo(this.ownerId, `${this.name}\u4ECE${levelBefore}\u7EA7\u5347\u7EA7\u81F3${this.level}\u7EA7\uFF01`);
    for (let l = levelBefore || 1; l < this.level; l++) this.base?.triggerEvent(`dws:lv${l}_${l + 1}`);
    if (this.isExist) {
    }
  }
  /**
   * Returns true if this dragon exist in the world.
   */
  get isExist() {
    let entity = world2.getEntity(this.entityId);
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
  switchState() {
    if (this.callOutCoolDown) {
      sendInfo(this.ownerId, `[${this.name}]\u53EC\u5524\u51B7\u5374\u4E2D\uFF0C\u5269\u4F59\u65F6\u95F4\uFF1A${this.callOutCoolDown / 20}s`);
      return this.isExist;
    }
    if (this.isExist) {
      this.back();
      system2.runTimeout(() => {
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
    let loc = this.owner.location;
    this.owner.runCommand(`structure load "${this.owner.name}_${this.typeId}" ${loc.x} ${loc.y + 1} ${loc.z}`);
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
    let stateInfo = `\u72B6\u6001: ${this.isExist ? "\u5DF2\u53EC\u5524" : this.callOutCoolDown ? `\u53EC\u5524\u51B7\u5374\uFF1A ${this.callOutCoolDown / 20}s` : "\u53EC\u56DE"}
`;
    let healthInfo = `\u751F\u547D\u503C: ${this.health} / ${this.maxHealth}
`;
    let levelInfo = `\u7B49\u7EA7: ${this.level} / ${this.maxLevel} 
`;
    let energyInfo = `\u80FD\u91CF: ${this.energy} / ${this.maxEnergy}
`;
    let expInfo = `\u603B\u7ECF\u9A8C: ${this.exp}
`;
    return stateInfo + healthInfo + levelInfo + energyInfo + expInfo;
  }
};

// scripts/watch3.0/errors/warriorError.ts
var DragonExistError = class extends Error {
  constructor(playerName, entityType) {
    let message = `Player "${playerName}" already has a dragon "${entityType}".`;
    super(message);
    this.name = "DragonExistError";
  }
};

// scripts/watch3.0/modules/watch.ts
import { ActionFormData } from "@minecraft/server-ui";
var DWSUI = class {
  constructor() {
    this.titleText = "";
    this.bodyText = "";
    this.buttons = {};
  }
  title(titleText) {
    this.titleText = titleText;
    return this;
  }
  body(bodyText) {
    this.bodyText = bodyText;
    return this;
  }
  button(text, iconPath = "") {
    this.buttons[text] = iconPath;
    return this;
  }
  show(player) {
    let color = "\xA7" + (player.getDynamicProperty("color") || "w");
    let titleText = this.titleText;
    if (typeof this.titleText == void 0) titleText = "";
    if (typeof titleText == "string") titleText += color;
    else {
      if (titleText.rawtext) titleText.rawtext.push({ "text": color });
      else titleText.rawtext = [{ "text": color }];
    }
    let ui = new ActionFormData().title(titleText).body(this.bodyText);
    for (let buttonId in this.buttons) ui.button(buttonId, this.buttons[buttonId]);
    return ui.show(player);
  }
};
var Watch = class {
  constructor(player) {
    this.player = player;
    this.form = new DWSUI();
    this.form.title("\u6597\u9F99\u624B\u73AF");
    this.form.button("\u53EC\u5524/\u53EC\u56DE");
    this.form.button("\u4F7F\u7528\u6280\u80FD");
    this.form.button("\u6597\u9F99\u8FDB\u5316");
    this.form.button("\u67E5\u770B\u4FE1\u606F");
    this.form.button("\u8BBE\u7F6E");
  }
  /**
   * Chioce form.
   */
  choiceForm(showAll = true, btnName = (dragon) => {
    return dragon.name;
  }) {
    let form = new DWSUI();
    form.title("\u9009\u62E9");
    let dragons = manager.warrior.getWarrior(this.player.id).dragons;
    for (let dragon of dragons) if (btnName(dragon) && showAll || dragon.isExist) form.button(btnName(dragon), `textures/ui/${dragon.typeId.replace("dws:", "")}.${dragon.stage ? "v2_1" : "v1"}`);
    return form;
  }
  get colorForm() {
    let form = new DWSUI();
    form.title("\u9009\u62E9\u989C\u8272");
    let btns = [["\u91D1", "gold"], ["\u6728", "tree"], ["\u6C34", "water"], ["\u706B", "fire"], ["\u571F", "earth"], ["\u5149", "light"]];
    for (let btn of btns) form.button(btn[0], `textures/particles/${btn[1]}f`);
    return form;
  }
  get settingForm() {
    let form = new DWSUI();
    form.title("\u9009\u62E9");
    form.button("\u754C\u9762\u989C\u8272");
    return form;
  }
  abilityForm(selectId) {
    let warrior = manager.warrior.getWarrior(this.player.id);
    let dragons = warrior.dragons;
    let selected = dragons[selectId];
    let form = new DWSUI();
    form.title("\u9009\u62E9\u6280\u80FD");
    for (let abilityId of selected.abilities)
      if (isAbility(abilityId)) form.button(ABILITIES[abilityId].name);
    return form;
  }
  /**
   * Switch states of dragons.
   */
  switchState(selectId) {
    let warrior = manager.warrior.getWarrior(this.player.id);
    let dragons = warrior.dragons;
    let selected = dragons[selectId];
    selected.switchState();
  }
  useAbility(dragonId, abilityId) {
    let warrior = manager.warrior.getWarrior(this.player.id);
    let dragons = warrior.dragons;
    let selected = dragons[dragonId];
    let abilities = selected.abilities;
    selected.useAbility(abilities[abilityId]);
  }
  /**
   * show infos of dragons. 
   */
  showInfo() {
    let warrior = manager.warrior.getWarrior(this.player.id);
  }
  show() {
    this.form.show(this.player).then((arg) => {
      if (arg.canceled) return;
      switch (arg.selection) {
        case 0:
          this.choiceForm(true, (dragon) => {
            return dragon.isExist ? "\u53EC\u56DE" : dragon.callOutCoolDown ? `\u51B7\u5374${dragon.callOutCoolDown / 20}s` : "\u53EC\u5524";
          }).show(this.player).then((arg2) => {
            if (arg2.canceled) return;
            this.switchState(arg2.selection);
          });
          break;
        case 1:
          this.choiceForm(false).show(this.player).then((arg2) => {
            if (arg2.canceled) return;
            let dragonId = arg2.selection;
            this.abilityForm(arg2.selection).show(this.player).then((arg3) => {
              if (arg3.canceled) return;
              this.useAbility(dragonId, arg3.selection);
            });
          });
          break;
        case 2:
          this.choiceForm(false, (dragon) => {
            return dragon.canEvolve ? dragon.stage ? "\u590D\u539F" : "\u8FDB\u5316" : "";
          }).show(this.player).then((arg2) => {
            if (arg2.canceled) return;
            let warrior = manager.warrior.getWarrior(this.player.id);
            let dragons = warrior.dragons;
            dragons.forEach((dragon) => {
              if (!dragon.canEvolve) dragons.splice(dragons.indexOf(dragon), 1);
            });
            let selected = dragons[arg2.selection];
            selected.stage ? selected.back() : selected.evolve();
          });
          break;
        case 3:
          this.choiceForm().show(this.player).then((arg2) => {
            if (arg2.canceled) return;
            let warrior = manager.warrior.getWarrior(this.player.id);
            let dragons = warrior.dragons;
            let selected = dragons[arg2.selection];
            let infoForm = new DWSUI();
            infoForm.title(selected.name);
            infoForm.body(selected.getInfo());
            infoForm.button("", `textures/ui/${selected.typeId.replace("dws:", "")}.v1`);
            infoForm.show(this.player);
          });
          break;
        case 4:
          this.settingForm.show(this.player).then((arg2) => {
            if (arg2.canceled) return;
            switch (arg2.selection) {
              case 0:
                this.colorForm.show(this.player).then((arg3) => {
                  let colors = ["(", "[", "{", "}", "]", ")"];
                  if (arg3.canceled) return;
                  this.player.setDynamicProperty("color", colors[arg3.selection]);
                });
                break;
            }
          });
          break;
        default:
          break;
      }
    });
  }
};

// scripts/watch3.0/modules/warrior.ts
import { ModalFormData } from "@minecraft/server-ui";

// scripts/watch3.0/modules/extra.ts
var Backpack = class {
  constructor(container) {
    this.container = container;
  }
  getItemTotalAmount(itemType) {
    let amount = 0;
    for (let i = 0; i < this.container.size; i++) {
      let item = this.container.getItem(i);
      if (item && item.typeId == itemType) amount += item.amount;
    }
    return amount;
  }
  clearItem(itemType, amount) {
    for (let i = 0; i < this.container.size; i++) {
      let item = this.container.getItem(i);
      if (item && item.typeId == itemType) {
        amount -= item.amount;
        if (amount >= 0) this.container.setItem(i);
        else {
          item.amount = -amount;
          this.container.setItem(i, item);
          return;
        }
      }
    }
  }
};

// scripts/watch3.0/modules/warrior.ts
var defaultData = {
  dragons: {}
};
var Warrior = class {
  constructor(playerId) {
    this.base = world3.getEntity(playerId);
    this.watch = new Watch(this.base);
    this.dragonMap = {};
    for (let dragonType in this.data.dragons) this.dragonMap[dragonType] = new Dragon(this.base.id, dragonType);
    this.backpack = new Backpack(this.base.getComponent("minecraft:inventory")?.container);
  }
  /**
   * Player's data.
   */
  get data() {
    let data = this.base?.getDynamicProperty("dws");
    if (!data) data = JSON.stringify(defaultData);
    return JSON.parse(data);
  }
  set data(warriorData) {
    let data = JSON.stringify(warriorData);
    this.base?.setDynamicProperty("dws", data);
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
    let entity = world3.getEntity(entityId);
    if (!entity || !entity?.isValid) return;
    if (entity.typeId in this.data.dragons && !forceAdd)
      throw new DragonExistError(this.base.name, entity.typeId);
    if (!(entity.typeId in dragonData))
      throw new DragonIdentifierError(entity.typeId);
    let defaultAttr = {
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
    };
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
  addDragonByType(typeId, forceAdd = false) {
    if (!(typeId in dragonData)) throw new DragonIdentifierError(typeId);
    if (typeId in this.data.dragons && !forceAdd) throw new DragonExistError(this.base.name, typeId);
    let entity = this.base.dimension.spawnEntity(typeId, this.base.location);
    entity.getComponent("minecraft:tameable")?.tame(this.base);
    entity.triggerEvent("minecraft:on_tame");
    entity.addTag(`owner#${this.base.id}`);
    this.addDragon(entity.id, forceAdd);
  }
  hasDragon(dragonType) {
    return dragonType in this.data.dragons;
  }
  getDragon(dragonType) {
    for (let dragon of this.dragons) {
      if (dragon.typeId == dragonType) return dragon;
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
    form.title("\u4F7F\u7528\u7ECF\u9A8C\u70B9");
    form.dropdown("\u4F7F\u7528\u4E8E", dragonNames);
    form.slider("\u4F7F\u7528\u6570\u91CF", 1, expAmount);
    form.show(this.base).then((arg) => {
      if (arg.canceled) return;
      if (arg.formValues) {
        let selected = this.dragons[arg.formValues[0]];
        let amount = arg.formValues[1];
        let remain = selected.addExp(amount * 10) / 10;
        this.backpack.clearItem("dws:exp", remain);
      }
    });
  }
};

// scripts/watch3.0/managers/warriorManager.ts
var WarriorManager = class {
  constructor() {
    this.warriors = {};
    system3.run(() => world4.getAllPlayers().forEach((player) => this.getWarrior(player.id)));
    world4.afterEvents.playerSpawn.subscribe((arg) => {
      this.getWarrior(arg.player.id);
    });
  }
  getWarrior(playerId) {
    if (!(playerId in this.warriors)) this.warriors[playerId] = new Warrior(playerId);
    if (!this.warriors[playerId].base.isValid) this.warriors[playerId] = new Warrior(playerId);
    return this.warriors[playerId];
  }
  getAllWarriors() {
    let warriors = [];
    for (let warriorId in this.warriors) warriors.push(this.warriors[warriorId]);
    return warriors;
  }
};
var warriorManager = new WarriorManager();

// scripts/watch3.0/managers/dragonManager.ts
var DragonManager = class {
  constructor() {
    world5.afterEvents.entityDie.subscribe((arg) => {
      let entityId = arg.deadEntity.id;
      let typeId = arg.deadEntity.typeId;
      system4.runTimeout(() => {
        warriorManager.getAllWarriors().forEach((warrior) => {
          if (warrior.getDragon(typeId)?.entityId == entityId) {
            let deadDragon = warrior.getDragon(typeId);
            deadDragon.callOutCoolDown = 6e3;
            deadDragon.health = 1;
            deadDragon.reduceExp(10);
            return;
          }
        });
      }, 30);
    });
  }
};
var dragonManager = new DragonManager();

// scripts/watch3.0/managers/manager.ts
var Manager = class {
  constructor() {
    this.warrior = warriorManager;
    this.ability = abilityManager;
    this.dragon = dragonManager;
  }
};
var manager = new Manager();

// scripts/watch3.0/utils/base.ts
import { world as world6 } from "@minecraft/server";

// scripts/watch3.0/config/elements.ts
var ElementInteractions = {
  "gold": {
    "increase": ["wood" /* Wood */, "fire" /* Fire */],
    "decrease": ["gold" /* Gold */, "water" /* Water */]
  },
  "wood": {
    "increase": ["water" /* Water */, "earth" /* Earth */, "light" /* Light */],
    "decrease": ["gold" /* Gold */, "wood" /* Wood */, "fire" /* Fire */]
  },
  "water": {
    "increase": ["gold" /* Gold */, "fire" /* Fire */, "earth" /* Earth */],
    "decrease": ["wood" /* Wood */]
  },
  "fire": {
    "increase": ["gold" /* Gold */, "wood" /* Wood */],
    "decrease": ["water" /* Water */, "earth" /* Earth */]
  },
  "earth": {
    "increase": ["gold" /* Gold */, "fire" /* Fire */, "light" /* Light */],
    "decrease": ["wood" /* Wood */, "water" /* Water */]
  },
  "light": {
    "increase": ["water" /* Water */],
    "decrease": ["gold" /* Gold */, "wood" /* Wood */, "earth" /* Earth */]
  },
  "void": {
    "increase": [],
    "decrease": []
  }
};

// scripts/watch3.0/utils/base.ts
world6.afterEvents.entityHurt.subscribe((arg) => {
  let damagingEntity = arg.damageSource.damagingEntity;
  if (!damagingEntity) return;
  let attacker = damagingEntity;
  let attackerEls = tryGetElements(attacker);
  if (!attackerEls) return;
  let hurt = arg.hurtEntity;
  let hurtEls = tryGetElements(hurt);
  if (!hurtEls) return;
  let effect = 0;
  for (let attackerEl of attackerEls) {
    let increase = ElementInteractions[attackerEl]["increase"];
    let decrease = ElementInteractions[attackerEl]["decrease"];
    for (let hurtEl of hurtEls) {
      if (increase.indexOf(hurtEl) >= 0) effect++;
      if (decrease.indexOf(hurtEl) >= 0) effect--;
    }
  }
  for (let t = 0; t < effect; t++) {
    let health = hurt.getComponent("minecraft:health");
    if (hurt.isValid && health)
      health.setCurrentValue(Math.max(0, health.currentValue - arg.damage / (t + 1)));
  }
  for (let t = 0; t < -effect; t++) {
    let health = hurt.getComponent("minecraft:health");
    if (hurt.isValid && health)
      health.setCurrentValue(Math.min(health.effectiveMax, health.currentValue + arg.damage / (t + 2)));
  }
});

// scripts/main.ts
var aEvents = world7.afterEvents;
aEvents.itemUse.subscribe((arg) => {
  if (arg.itemStack.typeId.indexOf("dws:") < 0) return;
  let warrior = manager.warrior.getWarrior(arg.source.id);
  if (arg.itemStack.typeId == "dws:dragon_watch") {
    warrior.watch.show();
  }
  if (arg.itemStack.typeId.indexOf("_card") >= 0) {
    let dragonType = arg.itemStack.typeId.replace("_card", "");
    if (isDragon(dragonType)) {
      if (!warrior.hasDragon(dragonType)) {
        warrior.addDragonByType(dragonType);
        if (warrior.dragons.length == 1) {
          warrior.base.runCommand("give @s dws:dragon_watch");
        }
      }
    }
  }
  if (arg.itemStack.typeId == "dws:exp") {
    warrior.showExpForm();
  }
});

//# sourceMappingURL=../debug/main.js.map
