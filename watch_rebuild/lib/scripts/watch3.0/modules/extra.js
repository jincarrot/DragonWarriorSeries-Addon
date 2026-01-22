export class Backpack {
    constructor(container) {
        this.container = container;
    }
    getItemTotalAmount(itemType) {
        let amount = 0;
        for (let i = 0; i < this.container.size; i++) {
            let item = this.container.getItem(i);
            if (item && item.typeId == itemType)
                amount += item.amount;
        }
        return amount;
    }
    clearItem(itemType, amount) {
        for (let i = 0; i < this.container.size; i++) {
            let item = this.container.getItem(i);
            if (item && item.typeId == itemType) {
                amount -= item.amount;
                if (amount >= 0)
                    this.container.setItem(i);
                else {
                    item.amount = -amount;
                    this.container.setItem(i, item);
                    return;
                }
            }
        }
    }
}
//# sourceMappingURL=extra.js.map