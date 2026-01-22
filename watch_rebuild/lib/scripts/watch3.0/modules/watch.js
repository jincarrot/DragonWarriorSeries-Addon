import { ActionFormData } from "@minecraft/server-ui";
import { manager } from "../managers/manager";
import { isAbility } from "../utils/game";
import { ABILITIES } from "../config/abilities";
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
        this.form.button("使用技能");
        this.form.button("查看信息");
        this.form.button("设置");
    }
    /**
     * Chioce form.
     */
    choiceForm(showAll = true) {
        let form = new DWSUI();
        form.title("选择");
        let dragons = manager.warrior.getWarrior(this.player.id).dragons;
        for (let dragon of dragons)
            if (showAll || dragon.isExist)
                form.button(dragon.name, `textures/ui/${dragon.typeId.replace("dws:", "")}.v1`);
        return form;
    }
    get colorForm() {
        let form = new DWSUI();
        form.title("选择颜色");
        let btns = [["金", "gold"], ["木", "tree"], ["水", "water"], ["火", "fire"], ["土", "earth"], ["光", "light"]];
        for (let btn of btns)
            form.button(btn[0], `textures/ui/${btn[1]}logo`);
        return form;
    }
    get settingForm() {
        let form = new DWSUI();
        form.title("选择");
        form.button("界面颜色");
        return form;
    }
    abilityForm(selectId) {
        let warrior = manager.warrior.getWarrior(this.player.id);
        let dragons = warrior.dragons;
        let selected = dragons[selectId];
        let form = new DWSUI();
        form.title("选择技能");
        for (let abilityId of selected.abilities)
            if (isAbility(abilityId))
                form.button(ABILITIES[abilityId].name);
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
        //
    }
    show() {
        this.form.show(this.player).then((arg) => {
            if (arg.canceled)
                return;
            switch (arg.selection) {
                case 0:
                    this.choiceForm().show(this.player).then((arg) => {
                        if (arg.canceled)
                            return;
                        this.switchState(arg.selection);
                    });
                    break;
                case 1:
                    this.choiceForm(false).show(this.player).then((arg) => {
                        if (arg.canceled)
                            return;
                        let dragonId = arg.selection;
                        this.abilityForm(arg.selection).show(this.player).then((arg) => {
                            if (arg.canceled)
                                return;
                            this.useAbility(dragonId, arg.selection);
                        });
                    });
                    break;
                case 2:
                    this.choiceForm().show(this.player).then((arg) => {
                        if (arg.canceled)
                            return;
                        let warrior = manager.warrior.getWarrior(this.player.id);
                        let dragons = warrior.dragons;
                        let selected = dragons[arg.selection];
                        let infoForm = new DWSUI();
                        infoForm.title(selected.name);
                        infoForm.body(selected.getInfo());
                        infoForm.button("", `textures/ui/${selected.typeId.replace("dws:", "")}.v1`);
                        infoForm.show(this.player);
                    });
                    break;
                case 3:
                    this.settingForm.show(this.player).then((arg) => {
                        if (arg.canceled)
                            return;
                        switch (arg.selection) {
                            case 0:
                                this.colorForm.show(this.player).then((arg) => {
                                    let colors = ["(", "[", "{", "}", "]", ")"];
                                    if (arg.canceled)
                                        return;
                                    this.player.setDynamicProperty("color", colors[arg.selection]);
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
}
//# sourceMappingURL=watch.js.map