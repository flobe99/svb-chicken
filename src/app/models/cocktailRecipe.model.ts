import { Bottles } from "./bottles.model";

export class CocktailRecipe {
    index: string;
    name: string;
    bottles: Bottles[];

    constructor(obj?: Partial<CocktailRecipe>) {
        this.index = obj?.index || '';
        this.name = obj?.name || '';
        this.bottles = (obj?.bottles || []).map(b => new Bottles(b));
    }
}
