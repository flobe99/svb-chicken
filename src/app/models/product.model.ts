
export class Product {
    id?: number;
    product: string;
    price: number;

    constructor(obj?: Partial<Product>) {
        this.id = obj?.id;
        this.product = obj?.product || '';
        this.price = obj?.price || 0.0;
    }
}

