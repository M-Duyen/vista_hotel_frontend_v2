/* eslint-disable */
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
// SockJS removed: native WebSocket is used instead (via brokerURL).
// SockJS was causing cross-origin session-cookie failures with the notification-service.

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
    private currentUserId: string | null = null;
    private currentUserType: string | null = null;
    private connectionPromise: Promise<void> | null = null;
    private disconnectTimeout: any = null;

    // constructor() {
    //     console.log('WebSocket Service initialized');
    // }

    connect(
        userId: string,
        userType: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN',
    ): Promise<void> {
        if (this.disconnectTimeout) {
            clearTimeout(this.disconnectTimeout);
            this.disconnectTimeout = null;
        }

        if (this.client && this.currentUserId === userId && this.currentUserType === userType) {
            if (this.connected) {
                return Promise.resolve();
            }
            if (this.connectionPromise) {
                return this.connectionPromise;
            }
        }

        if (this.client) {
            this.disconnectImmediately();
        }

        this.currentUserId = userId;
        this.currentUserType = userType;

        this.connectionPromise = new Promise((resolve, reject) => {
            console.log(`WebSocket connecting as ${userId} (${userType}) using WS_URL:`, WS_URL);

            this.client = new Client({
                // Native WebSocket via brokerURL (ws:// or wss://).
                // SockJS was replaced because its session-cookie management
                // fails reliably in cross-origin browser → backend connections.
                brokerURL: WS_URL,
                connectHeaders: {
                    userId,
                    userType,
                },
                reconnectDelay: 3000,
                debug: (str) => console.log('[STOMP]', str),

                onConnect: () => {
                    console.log('WebSocket Connected successfully!');
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

        return this.connectionPromise;
    }

    private subscribeUserQueue(userId: string) {
        if (!this.client) return;

        // Spring resolves /user/queue/* to the current session user
        const dest = `/user/queue/notifications`;
        console.log('Subscribing to', dest);

        const sub = this.client.subscribe(dest, (msg) => this.handle(msg));
        this.subscriptions.set('user', sub);

        const directDest = `/topic/notifications/user/${userId}`;
        console.log('Subscribing to', directDest);

        const directSub = this.client.subscribe(directDest, (msg) =>
            this.handle(msg),
        );
        this.subscriptions.set('user-direct', directSub);
    }

    private subscribeBroadcast(userType: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN') {
        if (!this.client) return;

        let topics: string[] = [];

        if (userType === 'CUSTOMER') {
            topics = ['/topic/notifications/customer'];
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
        if (this.disconnectTimeout) {
            clearTimeout(this.disconnectTimeout);
        }

        this.disconnectTimeout = setTimeout(() => {
            this.disconnectTimeout = null;
            this.disconnectImmediately();
        }, 1000); // 1s delay
    }

    private disconnectImmediately() {
        if (!this.client) return;

        console.log('Disconnecting WebSocket immediately for user:', this.currentUserId);
        this.subscriptions.forEach((s) => s.unsubscribe());
        this.subscriptions.clear();

        this.client.deactivate();
        this.client = null;
        this.connected = false;
        this.currentUserId = null;
        this.currentUserType = null;
        this.connectionPromise = null;

        console.log('WebSocket disconnected');
    }

    isConnected() {
        return this.connected;
    }
}

export const websocketService = new WebSocketService();
