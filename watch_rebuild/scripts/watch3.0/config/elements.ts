import { ElementType } from "../enums/attr";

export const ElementInteractions: Record<ElementType, Record<string, ElementType[]>> = {
    "gold": {
        "increase": [ElementType.Wood, ElementType.Fire],
        "decrease": [ElementType.Gold, ElementType.Water]
    },
    "wood": {
        "increase": [ElementType.Water, ElementType.Earth, ElementType.Light],
        "decrease": [ElementType.Gold, ElementType.Wood, ElementType.Fire]
    },
    "water": {
        "increase": [ElementType.Gold, ElementType.Fire, ElementType.Earth],
        "decrease": [ElementType.Wood]
    },
    "fire": {
        "increase": [ElementType.Gold, ElementType.Wood],
        "decrease": [ElementType.Water, ElementType.Earth]
    },
    "earth": {
        "increase": [ElementType.Gold, ElementType.Fire, ElementType.Light],
        "decrease": [ElementType.Wood, ElementType.Water]
    },
    "light": {
        "increase": [ElementType.Water],
        "decrease": [ElementType.Gold, ElementType.Wood, ElementType.Earth]
    },
    "void": {
        "increase": [],
        "decrease": []
    }
}