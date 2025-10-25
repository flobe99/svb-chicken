import { OrderSummarySlot } from "./order.model";
export class TimeSlotConfig {
    date: string;
    range_start: string;
    range_end: string;
    slots: OrderSummarySlot[];
    total: {
        chicken: number;
        nuggets: number;
        fries: number;
    };

    constructor(obj?: Partial<TimeSlotConfig>) {
        this.date = obj?.date || '';
        this.range_start = obj?.range_start || '';
        this.range_end = obj?.range_end || '';
        this.slots = obj?.slots || [];
        this.total = {
            chicken: obj?.total?.chicken ?? 0,
            nuggets: obj?.total?.nuggets ?? 0,
            fries: obj?.total?.fries ?? 0
        };
    }
}