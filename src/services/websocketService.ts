/* eslint-disable */
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL;
console.log('WebSocket using WS_URL:', WS_URL);

export interface NotificationMessage {
    id: string;
    type: 'REQUEST' | 'INFO' | 'ALERT' | 'SYSTEM';
    category: string;
    title: string;
    message: string;
    fromUserId?: string;
    fromUserName?: string;
    toUserId?: string;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    isRead: boolean;
    createdAt: string;
}

class WebSocketService {
    private client: Client | null = null;
    private connected = false;
    private handlers: ((msg: NotificationMessage) => void)[] = [];
    private subscriptions: Map<string, any> = new Map();

    // constructor() {
    //     console.log('WebSocket Service initialized');
    // }

    connect(
        userId: string,
        userType: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN',
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.client?.connected) {
                console.log('WebSocket already connected');
                resolve();
                return;
            }

            // console.log(`WebSocket connecting as ${userId} (${userType})`);

            const sock = new SockJS(WS_URL);

            this.client = new Client({
                webSocketFactory: () => sock,
                reconnectDelay: 3000,
                debug: () => {},

                onConnect: () => {
                    console.log('WebSocket Connected!');
                    this.connected = true;

                    this.subscribeUserQueue(userId);
                    this.subscribeBroadcast(userType);

                    resolve();
                },

                onStompError: (frame) => {
                    console.error('STOMP ERROR', frame.headers['message']);
                    reject(new Error(frame.headers['message']));
                },

                onWebSocketError: () => {
                    console.error('WebSocket low-level socket error');
                },

                onWebSocketClose: () => {
                    console.warn('WebSocket closed');
                    this.connected = false;
                },
            });

            this.client.activate();
        });
    }

    private subscribeUserQueue(userId: string) {
        if (!this.client) return;

        const dest = `/user/${userId}/queue/notifications`;
        console.log('Subscribing to', dest);

        const sub = this.client.subscribe(dest, (msg) => this.handle(msg));
        this.subscriptions.set('user', sub);
    }

    private subscribeBroadcast(userType: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN') {
        if (!this.client) return;

        let topics: string[] = [];

        if (userType === 'CUSTOMER') {
            topics = []; // customer không nhận broadcast theo role
        } else if (userType === 'EMPLOYEE') {
            topics = [
                '/topic/notifications/employee',
                '/topic/notifications/admin',
            ];
        } else if (userType === 'ADMIN') {
            topics = [
                '/topic/notifications/admin',
                '/topic/notifications/employee',
            ];
        }

        topics.forEach((dest) => {
            console.log('Subscribing to broadcast', dest);
            const sub = this.client!.subscribe(dest, (msg) => this.handle(msg));
            this.subscriptions.set(dest, sub);
        });
    }

    private handle(msg: IMessage) {
        try {
            const parsed: NotificationMessage = JSON.parse(msg.body);
            console.log('Notification:', parsed);

            this.handlers.forEach((h) => h(parsed));
        } catch (e) {
            console.error('Failed to parse message', e);
        }
    }

    onMessage(handler: (msg: NotificationMessage) => void) {
        this.handlers.push(handler);

        return () => {
            const idx = this.handlers.indexOf(handler);
            if (idx >= 0) this.handlers.splice(idx, 1);
        };
    }

    disconnect() {
        if (!this.client) return;

        // console.log('Disconnecting WebSocket...');
        this.subscriptions.forEach((s) => s.unsubscribe());
        this.subscriptions.clear();

        this.client.deactivate();
        this.client = null;
        this.connected = false;
      
        console.log('WebSocket disconnected');
    }

    isConnected() {
        return this.connected;
    }
}

export const websocketService = new WebSocketService();
