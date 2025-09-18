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
    private isLoaded = false;

    constructor(
        private storageService: StorageService
    ) { }

    async loadOrderFromStorage(): Promise<OrderChicken | null> {
        if (!this.isLoaded) {
            const order = await this.storageService.get('order');
            this.order.next(order);
            this.isLoaded = true;
            return order;
        }
        return this.order.getValue();
    }


    setOrder(order: OrderChicken) {
        this.order.next(order);

        this.storageService.set('order', order);
    }

    getOrder(): Observable<OrderChicken | null> {
        return this.order.asObservable();
    }


    deleteOrder() {
        this.storageService.delete('order');
    }
}