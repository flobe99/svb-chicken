import { Injectable, NgZone } from '@angular/core';
import { CocktailStatus } from '../models/CocktailStatus.model';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private ws: WebSocket | null = null;
    private reconnectTimer: any = null;
    private heartbeatTimer: any = null;
    private readonly WS_URL = 'ws://192.168.199.35:8000/ws/status';

    constructor(private ngZone: NgZone) { }

    connect(onMessage: (status: CocktailStatus) => void): void {
        this.ws = new WebSocket(this.WS_URL);

        this.ws.onopen = () => {
            this.startHeartbeat();
        };

        this.ws.onmessage = (event) => {
            this.ngZone.run(() => {
                try {
                    const parsed: CocktailStatus = JSON.parse(event.data);
                    onMessage(parsed);
                } catch (error) {
                    console.error('Fehler beim Parsen der WebSocket-Nachricht:', error);
                }
            });
        };

        this.ws.onclose = () => {
            this.cleanupHeartbeat();
            this.scheduleReconnect(onMessage);
        };

        this.ws.onerror = () => {
            this.ws?.close();
        };
    }

    private startHeartbeat(): void {
        this.heartbeatTimer = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send('ping');
            }
        }, 10000);
    }

    private cleanupHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    private scheduleReconnect(onMessage: (status: CocktailStatus) => void): void {
        this.reconnectTimer = setTimeout(() => {
            this.connect(onMessage);
        }, 3000);
    }

    disconnect(): void {
        console.log('WebSocket wird geschlossen');
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        this.cleanupHeartbeat();
        this.ws?.close();
        this.ws = null;
    }
}
