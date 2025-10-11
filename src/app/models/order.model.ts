export enum OrderStatus {
    CREATED = "CREATED",
    CHECKED_IN = "CHECKED_IN",
    PAID = "PAID",
    PRINTED = "PRINTED",
    PREPARING = "PREPARING",
    READY_FOR_PICKUP = "READY_FOR_PICKUP",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export class OrderChicken {
    id?: number;
    firstname: string;
    lastname: string;
    mail: string;
    phonenumber: string;
    date: string;
    chicken: number;
    nuggets: number;
    fries: number;
    miscellaneous: string;
    status: OrderStatus;
    price: number;
    checked_in_at: string;

    constructor(obj?: Partial<OrderChicken>) {
        this.id = obj?.id;
        this.firstname = obj?.firstname || '';
        this.lastname = obj?.lastname || '';
        this.mail = obj?.mail || '';
        this.phonenumber = obj?.phonenumber || '';
        this.date = obj?.date || '';
        this.chicken = obj?.chicken || 0;
        this.nuggets = obj?.nuggets || 0;
        this.fries = obj?.fries || 0;
        this.miscellaneous = obj?.miscellaneous || '';
        this.status = obj?.status ?? OrderStatus.CREATED;
        this.price = obj?.price || 0;
        this.checked_in_at = obj?.checked_in_at || '';
    }
}

export class OrderSummarySlot {
    time: string;
    chicken: number;
    nuggets: number;
    fries: number;

    constructor(obj?: Partial<OrderSummarySlot>) {
        this.time = obj?.time || '';
        this.chicken = obj?.chicken || 0;
        this.nuggets = obj?.nuggets || 0;
        this.fries = obj?.fries || 0;
    }
}


export class OrderSummaryResponse {
    date: string;
    interval: string;
    slots: OrderSummarySlot[];
    total: {
        chicken: number;
        nuggets: number;
        fries: number;
    };

    constructor(obj?: Partial<OrderSummaryResponse>) {
        this.date = obj?.date || '';
        this.interval = obj?.interval || '';
        this.slots = (obj?.slots || []).map(s => new OrderSummarySlot(s));
        this.total = {
            chicken: obj?.total?.chicken || 0,
            nuggets: obj?.total?.nuggets || 0,
            fries: obj?.total?.fries || 0
        };
    }
}

