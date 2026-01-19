export interface DragonData {
    entityId: string;
    attributes: string[];
    abilities: number[];
    maxExp: number;
    energy: number;
    /**
     * exp refresh rules
     * 
     * A list, index 0 is level and 1 is max energy
     */
    rules: ((exp: number) => number)[];
    ownerId: string;
    exp: number;
    name: string;
}