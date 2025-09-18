
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { OrderService } from '../services/Order.Service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderGuard implements CanActivate {
  constructor(private orderService: OrderService, private router: Router) { }

  canActivate(): Promise<boolean> {
    return this.orderService.loadOrderFromStorage().then(order => {
      if (order) {
        return true;
      } else {
        this.router.navigate(['/order']);
        return false;
      }
    });
  }

}
