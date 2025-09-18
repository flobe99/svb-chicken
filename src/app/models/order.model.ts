export class OrderChicken {
    id: string;
    firstname: string;
    lastname: string;
    mail: string;
    phonenumber: string;
    date: string;
    chicken: number;
    nuggets: number;
    fries: number;
    miscellaneous: string;

    constructor(obj?: Partial<OrderChicken>) {
        this.id = obj?.id || '';
        this.firstname = obj?.firstname || '';
        this.lastname = obj?.lastname || '';
        this.mail = obj?.mail || '';
        this.phonenumber = obj?.phonenumber || '';
        this.date = obj?.date || '';
        this.chicken = obj?.chicken || 0;
        this.nuggets = obj?.nuggets || 0;
        this.fries = obj?.fries || 0;
        this.miscellaneous = obj?.miscellaneous || '';
    }
}