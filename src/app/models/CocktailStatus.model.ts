export class CocktailStatus {
    cocktail_name: string;
    current_ingredient?: string;
    progress: number;
    message?: string;
    finished: boolean;

    constructor(obj?: Partial<CocktailStatus>) {
        this.cocktail_name = obj?.cocktail_name || '';
        this.current_ingredient = obj?.current_ingredient;
        this.progress = obj?.progress ?? 0;
        this.message = obj?.message;
        this.finished = obj?.finished ?? false;
    }
}
