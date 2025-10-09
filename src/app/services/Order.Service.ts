import { Injectable } from '@angular/core';
import { OrderChicken, OrderStatus } from '../models/order.model';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

// export const DOMAIN = '192.168.199.133:8000';
// export const API_URL = `http://${DOMAIN}`;
// export const SOCKET = `ws://${DOMAIN}/ws/orders`;

export const API_URL = 'https://svb-chicken-backend.onrender.com'
export const SOCKET = 'wss://svb-chicken-backend.onrender.com/ws/orders'

@Injectable({
    providedIn: 'root',
})
export class OrderService {
    private order = new BehaviorSubject<OrderChicken | null>(null);
    private isLoaded = false;
    private socket: WebSocket | null = null;

    constructor(
        private storageService: StorageService,
        private http: HttpClient
    ) { }

    // Lokale Speicherung
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

    async getOrder(): Promise<Observable<OrderChicken | null>> {
        await this.loadOrderFromStorage()
        return this.order.asObservable();
    }

    deleteOrder() {
        this.storageService.delete('order');
    }

    // GET /orders
    getOrders(status?: OrderStatus): Observable<OrderChicken[]> {
        const url = status ? `${API_URL}/orders?status=${status}` : `${API_URL}/orders`;
        return this.http.get<Partial<OrderChicken>[]>(url).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Fehler beim Abrufen der Bestellungen:', error);
                return of([]);
            }),
            map((data) => data.map((item) => new OrderChicken(item)))
        );
    }

    // POST /order
    createOrder(order: OrderChicken): Observable<any> {
        return this.http.post(`${API_URL}/order`, order).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Fehler beim Erstellen der Bestellung:', error);
                return of({ success: false, error });
            })
        );
    }

    // PUT /order/{id}
    updateOrder(id: number, updatedOrder: OrderChicken): Observable<any> {
        return this.http.put(`${API_URL}/order/${id}`, updatedOrder).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Fehler beim Aktualisieren der Bestellung:', error);
                return of({ success: false, error });
            })
        );
    }

    // DELETE /order/{id}
    deleteOrderById(id: number): Observable<any> {
        return this.http.delete(`${API_URL}/order/${id}`).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Fehler beim Löschen der Bestellung:', error);
                return of({ success: false, error });
            })
        );
    }



    connectToOrderWebSocket(onMessage: () => void) {
        this.socket = new WebSocket(`${SOCKET}`);

        this.socket.onopen = () => {
            console.log('WebSocket verbunden');
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('WebSocket Nachricht:', message);

            if (message.event?.startsWith('ORDER_')) {
                onMessage();
            }
        };

        this.socket.onclose = () => {
            console.log('WebSocket getrennt');
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket Fehler:', error);
        };
    }


}
