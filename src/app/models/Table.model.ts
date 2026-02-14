export class Table {
    id?: number;
    name: string;
    seats: number;

    constructor(obj?: Partial<Table>) {
        this.id = obj?.id;
        this.name = obj?.name || '';
        this.seats = obj?.seats ?? 0;
    }
}
