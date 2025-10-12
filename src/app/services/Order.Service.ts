import { Injectable } from '@angular/core';
import { OrderChicken, OrderStatus, OrderSummaryResponse } from '../models/order.model';
import { ConfigChicken, Product } from '../models/product.model';
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

    // GET /orders/summary
    getOrderSummary(date: string, interval: string): Observable<OrderSummaryResponse> {
        const url = `${API_URL}/orders/summary?date=${date}&interval=${encodeURIComponent(interval)}`;
        return this.http.get<Partial<OrderSummaryResponse>>(url).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Fehler beim Abrufen der Zusammenfassung:', error);
                return of({
                    date,
                    interval,
                    slots: [],
                    total: {
                        chicken: 0,
                        nuggets: 0,
                        fries: 0
                    }
                });
            }),
            map((data) => new OrderSummaryResponse(data))
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

    // POST /order/price
    getOrderPrice(order: OrderChicken): Observable<number> {
        order.checked_in_at = null as any;
        return this.http.post<{ price: number }>(`${API_URL}/order/price`, order).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Fehler beim Berechnen des Preises:', error);
                return of({ price: 0 });
            }),
            map((response) => response.price)
        );
    }

    getProducts(): Observable<Product[]> {
        // return this.http.get<Product[]>(`${API_URL}/products`);
        return this.http.get<Partial<Product>[]>(`${API_URL}/products`).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Fehler beim Abrufen des Products:', error);
                return of([]);
            }),
            map((data) => data.map((item) => new Product(item)))
        );
    }

    updateProduct(product: Product): Observable<any> {
        if (!product.id || !product.product || product.price == null) {
            console.warn('Ungültiges Produkt:', product);
            return of({ success: false, error: 'Ungültige Produktdaten' });
        }

        return this.http.put(`${API_URL}/product/${product.id}`, product).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Fehler beim Aktualisieren des Produktes:', error);
                return of({ success: false, error });
            })
        );
    }

    getConfig(): Observable<ConfigChicken | null> {
        return this.http.get<Partial<ConfigChicken>>(`${API_URL}/config/0`).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Fehler beim Abrufen der Konfiguration mit ID 0:', error);
                return of(null);
            }),
            map((data) => data ? new ConfigChicken(data) : null)
        );
    }


    updateConfig(configId: number, config: ConfigChicken): Observable<any> {
        return this.http.put(`${API_URL}/config/${configId}`, config).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Fehler beim Aktualisieren der Konfiguration:', error);
                return of({ success: false });
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
