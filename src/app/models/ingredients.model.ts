export class Ingredients {
    name: string;
    amountLiter: number;

    constructor(obj?: Partial<Ingredients>) {
        this.name = obj?.name || '';
        this.amountLiter = obj?.amountLiter ?? 0;
    }
}