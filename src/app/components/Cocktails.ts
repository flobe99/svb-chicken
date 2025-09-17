import { CocktailRecipe } from "../models/cocktailRecipe.model";

export const cocktails_selection: CocktailRecipe[] = [
    {
        index: 'aperol',
        name: 'Aperol',
        bottles: [
            { name: 'Aperol', index: 'aperol', ratio: 0.3 },
            { name: 'Sekt', index: 'sekt', ratio: 0.4 },
            { name: 'Wasser', index: 'wasser', ratio: 0.3 },
        ],
    },
    {
        index: 'cuba',
        name: 'Cuba',
        bottles: [
            { name: 'Havana', index: 'havana', ratio: 0.25 },
            { name: 'Cola', index: 'cola', ratio: 0.75 },
        ],
    },
    {
        index: 'bacardi-cola',
        name: 'Bacardi-Cola',
        bottles: [
            { name: 'Bacardi', index: 'bacardi', ratio: 0.25 },
            { name: 'Cola', index: 'cola', ratio: 0.75 },
        ],
    },
    {
        index: 'asbach-cola',
        name: 'Asbach-Cola',
        bottles: [
            { name: 'Asbach', index: 'asbach', ratio: 0.25 },
            { name: 'Cola', index: 'cola', ratio: 0.75 },
        ],
    },
];
