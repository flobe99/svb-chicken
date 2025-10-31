import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { Account } from '../models/Account.model';
import { OrderService } from './Order.Service';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private loginListener = new BehaviorSubject<Account | null>(null);
  private loggedInAccount: Account | null = null;
  private hash: string | null=null;
  private jumpBackToUrl: string | null = null;

  constructor(
    private orderService: OrderService,
    private storageService: StorageService,
    private router: Router) {
    this.init();
  }

  init(){
          this.storageService.get('login_hash').then((hash) => {
          if (hash && hash.length) {
            this.storageService.get('account').then((account) => {
              if (account) {
                this.loginByStoredHash(account, hash);
              }
            });
          }
        });
  }

  public saveLoginHash(hash: string) {
    this.hash = hash;
    this.storageService.set('login_hash', hash);
  }

  public setJumpBackUrl(url: string | null) {
    this.jumpBackToUrl = url;
  }

  getAccountLogin(): Observable<Account | null> {
    return this.loginListener.asObservable();
  }

  isLoggedIn(): boolean {
    return (
      this.loggedInAccount !== null && this.loggedInAccount.access_token !== ''
    );
  }

  getLoggedInAccount(): Account | null {
    return this.loggedInAccount;
  }

  private loginByStoredHash(account: Account | null, hash: string) {
    this.hash = hash;
    if (account && account.access_token) {
      this.loggedInAccount = account;
      this.loginListener.next(account);
      this.storageService.set('account', account);
      if(this.jumpBackToUrl)
      {
        this.router.navigateByUrl(this.jumpBackToUrl).then();
      }
      this.jumpBackToUrl = null;
    } else {
      this.loggedInAccount = null;
      this.loginListener.next(null);
    }
  }
  
  login(username: string, password: string): Observable<Account> {
    return this.orderService.login(username, password).pipe(
      switchMap((tokenResponse: any) => {
        const token = tokenResponse.access_token;
        return this.orderService.getCurrentUser(token).pipe(
          map((userData: any) => {
            const account = new Account({ ...userData, access_token: token });
            this.loggedInAccount = account;
            this.loginListener.next(account);
            this.saveLoginHash(token);
            this.loginByStoredHash(account, token)
            return account;
          })
        );
      })
    );
  }

  logout(){
    this.storageService.delete('account');
    this.storageService.delete('login_hash');
    this.loginByStoredHash(null, "")
  }

}
