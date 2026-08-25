import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { getConsultationWebSocketUrl } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

class StompClientManager {
  private client: Client | null = null;
  private connectionPromise: Promise<void> | null = null;
  private subscribers = new Map<string, Set<(message: IMessage) => void>>();
  private activeSubscriptions = new Map<string, StompSubscription>();
  private connectionCount = 0;
  public status: "connecting" | "connected" | "disconnected" = "disconnected";
  private statusListeners = new Set<(status: "connecting" | "connected" | "disconnected") => void>();
  private active = false;

  private notifyStatus(status: "connecting" | "connected" | "disconnected") {
    this.status = status;
    this.statusListeners.forEach((l) => l(status));
  }

  public subscribeStatus(listener: (status: "connecting" | "connected" | "disconnected") => void) {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public async connect() {
    this.connectionCount++;
    if (this.connectionCount > 1 && this.client) {
      if (this.status === "connected") {
        this.notifyStatus("connected");
      }
      return;
    }
    
    this.active = true;
    if (!this.client) {
      this.client = new Client({
        brokerURL: getConsultationWebSocketUrl(),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        beforeConnect: async () => {
          const { data, error } = await getSupabaseBrowserClient().auth.getSession();
          if (error || !data.session) {
            throw new Error(error?.message ?? "Your authentication session has expired.");
          }
          if (this.client) {
            this.client.connectHeaders = {
              Authorization: `Bearer ${data.session.access_token}`,
            };
          }
          if (this.active) this.notifyStatus("connecting");
        },
        onConnect: () => {
          if (!this.active) return;
          this.notifyStatus("connected");
          this.resubscribeAll();
        },
        onStompError: () => {
          if (this.active) this.notifyStatus("disconnected");
        },
        onWebSocketError: () => {
          if (this.active) this.notifyStatus("disconnected");
        },
        onWebSocketClose: () => {
          if (this.active) this.notifyStatus("disconnected");
        },
      });
    }
    
    if (this.client && !this.client.active) {
      this.client.activate();
    }
  }

  public disconnect() {
    this.connectionCount = Math.max(0, this.connectionCount - 1);
    if (this.connectionCount === 0) {
      this.active = false;
      this.client?.deactivate();
      this.client = null;
      this.notifyStatus("disconnected");
      this.activeSubscriptions.clear();
    }
  }

  public subscribe(destination: string, callback: (message: IMessage) => void) {
    if (!this.subscribers.has(destination)) {
      this.subscribers.set(destination, new Set());
    }
    this.subscribers.get(destination)!.add(callback);

    if (this.client && this.client.connected && !this.activeSubscriptions.has(destination)) {
      this.doSubscribe(destination);
    }

    return () => {
      const callbacks = this.subscribers.get(destination);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(destination);
          const sub = this.activeSubscriptions.get(destination);
          if (sub) {
            sub.unsubscribe();
            this.activeSubscriptions.delete(destination);
          }
        }
      }
    };
  }

  private resubscribeAll() {
    for (const destination of this.subscribers.keys()) {
      this.doSubscribe(destination);
    }
  }

  private doSubscribe(destination: string) {
    if (!this.client || !this.client.connected) return;
    if (this.activeSubscriptions.has(destination)) {
      this.activeSubscriptions.get(destination)!.unsubscribe();
    }
    const sub = this.client.subscribe(destination, (message) => {
      const callbacks = this.subscribers.get(destination);
      if (callbacks) {
        callbacks.forEach((cb) => cb(message));
      }
    });
    this.activeSubscriptions.set(destination, sub);
  }
}

export const sharedStompClient = new StompClientManager();
