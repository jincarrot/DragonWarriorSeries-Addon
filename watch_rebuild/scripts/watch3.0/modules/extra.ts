import { Container } from "@minecraft/server";

export class Backpack {
    readonly container: Container;

    constructor(container: Container) {
        this.container = container;
    }

    getItemTotalAmount(itemType: string) {
        let amount = 0;
        for (let i = 0; i < this.container.size; i++) {
            let item = this.container.getItem(i);
            if (item && item.typeId == itemType) amount += item.amount;
        }
        return amount;
    }

    clearItem(itemType: string, amount: number) {
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
}