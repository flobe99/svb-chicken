import { Injectable } from '@angular/core';
import { OrderChicken } from '../models/order.model';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';





export interface MixResponse {
    success: boolean;
    msg?: string;
}

@Injectable({
    providedIn: 'root',
})
export class OrderService {
    private order = new BehaviorSubject<OrderChicken | null>(null);
    constructor(
        private storageService: StorageService
    ) { }

    setOrder(order: OrderChicken) {
        this.order.next(order);

        this.storageService.set('order', order);
    }

    getOrder(): Observable<OrderChicken | null> {
        this.storageService.get('order').then((order) => {
            this.order.next(order);
        });
        return this.order.asObservable();
    }

    deleteOrder() {
        this.storageService.delete('order');
    }
}