export class Product {
  id?: number;
  product: string;
  price: number;
  name: string;

  constructor(obj?: Partial<Product>) {
    this.id = obj?.id;
    this.product = obj?.product || '';
    this.price = obj?.price || 0.0;
    this.name = obj?.name || '';
  }
}

export class ConfigChicken {
  id: number;
  chicken: number;
  nuggets: number;
  fries: number;

  constructor(obj?: Partial<ConfigChicken>) {
    this.id = obj?.id || 0;
    this.chicken = obj?.chicken || 0.0;
    this.nuggets = obj?.nuggets || 0.0;
    this.fries = obj?.fries || 0.0;
  }
}
