import { ActionFormData } from "@minecraft/server-ui";
import { Player, RawMessage } from "@minecraft/server"

/**
 * Builds a simple player form with buttons that let the player take action.
 */
export class DWSUI extends ActionFormData {
    titleText;
    bodyText;
    buttons;
    constructor() {
        this.buttons = {};
    }

    /**
     * 
     * @param {RawMessage | string} titleText 
     * @remarks
        This builder method sets the title for the modal dialog.

        This function can't be called in read-only mode.
     */
    title(titleText) {
        this.titleText = titleText;
        return this;
    }
    /**
     * 
     * @param {RawMessage | string} bodyText 
     * @remarks
        Method that sets the body text for the modal form.

        This function can't be called in read-only mode.
     */
    body(bodyText){
        this.bodyText = bodyText;
        return this;
    }
    /**
     * 
     * @param {RawMessage | string} text the button's name
     * @param {string} iconPath the button's icon
     * @remarks
        Adds a button to this form with an icon from a resource pack.

        This function can't be called in read-only mode.
     */
    button(text, iconPath = ""){
        super.button()
        buttons[text] = iconPath;
        return this;
    }

    /**
     * 
     * @param {Player} player — Player to show this dialog to.
     * @remarks
        Creates and shows this modal popup form. Returns asynchronously when the player confirms or cancels the dialog.

        This function can't be called in read-only mode.
     *
     * @throws — This function can throw errors.
     */
    show(player){
        //set color
        let color = '§' + player.getDynamicProperty('color') || "w";
        let titleText = this.titleText;
        if (typeof this.titleText == 'undefined') titleText = '';
        if (typeof titleText == 'string') titleText += color;
        else {
            if (titleText.rawtext) titleText.rawtext.push({'text': color});
            else titleText.rawtext = {'text': color};
        }
        //show ui
        let ui = new ActionFormData()
            .title(titleText)
            .body(this.bodyText);
        for (let buttonId in this.buttons) ui.button(buttonId, this.buttons[buttonId]);
        return ui.show(player);
    }
}