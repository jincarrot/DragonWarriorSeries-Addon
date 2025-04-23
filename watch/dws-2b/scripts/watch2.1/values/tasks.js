import { Dragons } from "./constants"

export const tasks = [
    {
        'id': 0,
        'name': '启程',
        'texture': '',
        'condition': 'kill("any of", (() => {let a = [];for (let el of Object.keys(Dragons))a.push(`dws:${el}_zombie`);return a;})())'
    }
]