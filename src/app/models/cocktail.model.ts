import { Ingredients } from "./ingredients.model";

export class Cocktail {
    name: string;
    ingredients: Ingredients[];

    constructor(obj?: Partial<Cocktail>) {
        this.name = obj?.name || '';
        this.ingredients = (obj?.ingredients || []).map(b => new Ingredients(b));
    }
}
