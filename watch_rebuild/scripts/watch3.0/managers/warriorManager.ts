import { system, world } from "@minecraft/server";
import { Warrior } from "../modules/warrior";

export class WarriorManager{
    warriors: Record<string, Warrior>;

    constructor() {
        this.warriors = {};
        system.run(() => world.getAllPlayers().forEach((player) => this.getWarrior(player.id)));
        world.afterEvents.playerSpawn.subscribe((arg) => {
            this.getWarrior(arg.player.id);
        })
    }

    getWarrior(playerId: string) {
        if (!(playerId in this.warriors)) this.warriors[playerId] = new Warrior(playerId);
        if (!this.warriors[playerId].base.isValid) this.warriors[playerId] = new Warrior(playerId);
        return this.warriors[playerId];
    }

    getAllWarriors() {
        let warriors = [];
        for (let warriorId in this.warriors) warriors.push(this.warriors[warriorId]);
        return warriors;
    }
}

export const warriorManager = new WarriorManager();