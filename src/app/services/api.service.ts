import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderChicken } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://svb-chicken-backend.onrender.com';

  constructor(private http: HttpClient) {}

  sendOrder(order: Observable<OrderChicken>): Observable<any> {
    return this.http.post(this.apiUrl+"/order", order);
  }

  receiveOrder(): Observable<any>{
    return this.http.get(this.apiUrl+"/orders");
  }
}
