export class Slot {
    id?: number;
    label: string;
    date: string;
    range_start: string;
    range_end: string;

    constructor(obj?: Partial<Slot>) {
        this.id = obj?.id;
        this.label = obj?.label || '';
        this.date = obj?.date || '';
        this.range_start = obj?.range_start || '';
        this.range_end = obj?.range_end || '';
    }
}

