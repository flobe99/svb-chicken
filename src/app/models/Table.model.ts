import { TableReservation } from "./TableReservation.model";

export class Table {
    id?: number;
    name: string;
    seats: number;
    tableReservation?: TableReservation;

    constructor(obj?: Partial<Table>) {
        this.id = obj?.id;
        this.name = obj?.name || '';
        this.seats = obj?.seats ?? 0;
        this.tableReservation = obj?.tableReservation;
    }
}
