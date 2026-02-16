import { Table } from "./Table.model";

export class TableReservation {
    id?: number;
    customer_name: string;
    seats: number;
    start: string;
    end: string;
    table?: Table;

    constructor(obj?: Partial<TableReservation>) {
        this.id = obj?.id;
        this.customer_name = obj?.customer_name || '';
        this.seats = obj?.seats ?? 0;
        this.start = obj?.start || '';
        this.end = obj?.end || '';
        this.table = obj?.table;
    }
}
