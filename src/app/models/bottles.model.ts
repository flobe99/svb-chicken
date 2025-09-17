export class Bottles {
    index: string;
    name: string;
    ratio: number;

    constructor(obj?: Partial<Bottles>) {
        this.index = obj?.index || '';
        this.name = obj?.name || '';
        this.ratio = obj?.ratio ?? 0;
    }
}