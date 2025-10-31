export class Account {
  id?: number;
  username: string;
  email: string;
  verifyed: boolean;
  access_token: string;

  constructor(obj?: Partial<Account>) {
    this.id = obj?.id;
    this.username = obj?.username || '';
    this.email = obj?.email || '';
    this.verifyed = obj?.verifyed || false;
    this.access_token = obj?.access_token || '';
  }
}