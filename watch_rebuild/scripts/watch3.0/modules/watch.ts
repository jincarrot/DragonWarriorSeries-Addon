import { Player, RawText } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Warrior } from "./warrior";
import { manager } from "../managers/manager";
import { isAbility } from "../utils/game";
import { ABILITIES } from "../config/abilities";
import { Dragon } from "./dragon";


class DWSUI {
    private titleText: string | RawText;
    private bodyText: string | RawText;
    private buttons: Record<string, any>;

    constructor() {
        this.titleText = "";
        this.bodyText = "";
        this.buttons = {};
    }

    title(titleText: string | RawText) {
        this.titleText = titleText;
        return this;
    }

    body(bodyText: string | RawText) {
        this.bodyText = bodyText;
        return this;
    }

    button(text: string, iconPath = "") {
        this.buttons[text] = iconPath;
        return this;
    }

    show(player: Player) {
        //set color
        let color = '§' + (player.getDynamicProperty('color') || "w");
        let titleText = this.titleText;
        if (typeof this.titleText == undefined) titleText = '';
        if (typeof titleText == 'string') titleText += color;
        else {
            if (titleText.rawtext) titleText.rawtext.push({ 'text': color });
            else titleText.rawtext = [{ "text": color }];
        }
        //show ui
        let ui = new ActionFormData()
            .title(titleText)
            .body(this.bodyText);
        for (let buttonId in this.buttons) ui.button(buttonId, this.buttons[buttonId]);
        return ui.show(player as any);
    }

}

export class Watch {
    form: DWSUI;
    player: Player;

    constructor(player: Player) {
        this.player = player;
        this.form = new DWSUI();
        this.form.title("斗龙手环");
        this.form.button("召唤/召回");
        this.form.button("使用技能");
        this.form.button("斗龙进化");
        this.form.button("查看信息");
        this.form.button("设置");
    }

    /**
     * Chioce form.
     */
    private choiceForm(showAll = true, btnName=(dragon: Dragon) => {return dragon.name}) {
        let form = new DWSUI();
        form.title("选择");
        let dragons = manager.warrior.getWarrior(this.player.id).dragons;
        for (let dragon of dragons) if (btnName(dragon) && showAll || dragon.isExist) form.button(btnName(dragon), `textures/ui/${dragon.typeId.replace("dws:", "")}.${dragon.stage ? "v2_1" : "v1"}`);
        return form;
    }

    private get colorForm() {
        let form = new DWSUI();
        form.title("选择颜色");
        let btns = [["金", "gold"], ["木", "tree"], ["水", "water"], ["火", "fire"], ["土", "earth"], ["光", "light"]];
        for (let btn of btns) form.button(btn[0], `textures/particles/${btn[1]}f`);
        return form;
    }

    private get settingForm() {
        let form = new DWSUI();
        form.title("选择");
        form.button("界面颜色");
        return form;
    }

    private abilityForm(selectId: number) {
        let warrior = manager.warrior.getWarrior(this.player.id);
        let dragons = warrior.dragons;
        let selected = dragons[selectId];
        let form = new DWSUI();
        form.title("选择技能");
        for (let abilityId of selected.abilities)
            if (isAbility(abilityId)) form.button(ABILITIES[abilityId].name)
        return form;
    }

    /**
     * Switch states of dragons.
     */
    switchState(selectId: number) {
        let warrior = manager.warrior.getWarrior(this.player.id);
        let dragons = warrior.dragons;
        let selected = dragons[selectId];
        selected.switchState();
    }

    useAbility(dragonId: number, abilityId: number) {
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
            if (arg.canceled) return;
            switch (arg.selection) {
                case 0:
                    this.choiceForm(true, (dragon) => {return dragon.isExist ? "召回" : (dragon.callOutCoolDown ? `冷却${dragon.callOutCoolDown / 20}s` : "召唤")}).show(this.player).then((arg) => {
                        if (arg.canceled) return;
                        this.switchState(arg.selection as number);
                    });
                    break;
                case 1:
                    this.choiceForm(false).show(this.player).then((arg) => {
                        if (arg.canceled) return;
                        let dragonId = arg.selection;
                        this.abilityForm(arg.selection as number).show(this.player).then((arg) => {
                            if (arg.canceled) return;
                            this.useAbility(dragonId as number, arg.selection as number);
                        })
                    })
                    break;
                case 2:
                    this.choiceForm(false, (dragon) => {return dragon.canEvolve ? (dragon.stage ? "复原" : "进化") : ""}).show(this.player).then((arg) => {
                        if (arg.canceled) return;
                        let warrior = manager.warrior.getWarrior(this.player.id);
                        let dragons = warrior.dragons;
                        dragons.forEach((dragon) => {if (!dragon.canEvolve) dragons.splice(dragons.indexOf(dragon), 1)});
                        let selected = dragons[arg.selection as number];
                        selected.stage ? selected.back() : selected.evolve();
                    })
                    break;
                case 3:
                    this.choiceForm().show(this.player).then((arg) => {
                        if (arg.canceled) return;
                        let warrior = manager.warrior.getWarrior(this.player.id);
                        let dragons = warrior.dragons;
                        let selected = dragons[arg.selection as number];
                        let infoForm = new DWSUI()
                        infoForm.title(selected.name);
                        infoForm.body(selected.getInfo());
                        infoForm.button("", `textures/ui/${selected.typeId.replace("dws:", "")}.v1`)
                        infoForm.show(this.player)
                    })
                    break;
                case 4:
                    this.settingForm.show(this.player).then((arg) => {
                        if (arg.canceled) return;
                        switch (arg.selection) {
                            case 0:
                                this.colorForm.show(this.player).then((arg) => {
                                    let colors = ["(", "[", "{", "}", "]", ")"];
                                    if (arg.canceled) return;
                                    this.player.setDynamicProperty("color", colors[arg.selection as number]);
                                });
                                break;
                        }
                    })
                    break;
                default:
                    break;
            }
        });
    }
}