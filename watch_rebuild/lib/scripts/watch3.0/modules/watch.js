import { ActionFormData } from "@minecraft/server-ui";
import { manager } from "../managers/manager";
class DWSUI {
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
        //set color
        let color = '§' + (player.getDynamicProperty('color') || "w");
        let titleText = this.titleText;
        if (typeof this.titleText == undefined)
            titleText = '';
        if (typeof titleText == 'string')
            titleText += color;
        else {
            if (titleText.rawtext)
                titleText.rawtext.push({ 'text': color });
            else
                titleText.rawtext = [{ "text": color }];
        }
        //show ui
        let ui = new ActionFormData()
            .title(titleText)
            .body(this.bodyText);
        for (let buttonId in this.buttons)
            ui.button(buttonId, this.buttons[buttonId]);
        return ui.show(player);
    }
}
export class Watch {
    constructor(player) {
        this.player = player;
        this.form = new DWSUI();
        this.form.title("斗龙手环");
        this.form.button("召唤/召回");
    }
    /**
     * Chioce form.
     */
    get choiceForm() {
        let form = new DWSUI();
        form.title("选择");
        let dragons = manager.warrior.getWarrior(this.player.id).dragons;
        for (let dragon of dragons)
            form.button(dragon.name);
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
    /**
     * show infos of dragons.
     */
    showInfo() {
        let warrior = manager.warrior.getWarrior(this.player.id);
        //
    }
    show() {
        this.form.show(this.player).then((arg) => {
            if (arg.canceled)
                return;
            switch (arg.selection) {
                case 0:
                    this.choiceForm.show(this.player).then((arg) => {
                        if (arg.canceled)
                            return;
                        this.switchState(arg.selection);
                    });
                    break;
                case 1:
                    break;
                default:
                    break;
            }
        });
    }
}
//# sourceMappingURL=watch.js.map