"use client";

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import { getConsultationWebSocketUrl } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ConsultationEvent } from "@/types/consultations";

export type LiveConnectionStatus = "connecting" | "connected" | "disconnected";

export function useConsultationEvents(
  consultationId: string | undefined,
  onEvent: (event: ConsultationEvent) => void,
  onReconnect: () => void | Promise<void>,
) {
  const [status, setStatus] = useState<LiveConnectionStatus>("connecting");
  const onEventRef = useRef(onEvent);
  const onReconnectRef = useRef(onReconnect);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    if (!consultationId) return;
    let active = true;
    let subscription: StompSubscription | null = null;

    const client = new Client({
      brokerURL: getConsultationWebSocketUrl(),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      beforeConnect: async () => {
        const { data, error } = await getSupabaseBrowserClient().auth.getSession();
        if (error || !data.session) {
          throw new Error(error?.message ?? "Your authentication session has expired.");
        }
        client.connectHeaders = {
          Authorization: `Bearer ${data.session.access_token}`,
        };
        if (active) setStatus("connecting");
      },
      onConnect: () => {
        if (!active) return;
        subscription?.unsubscribe();
        subscription = client.subscribe("/user/queue/consultation-events", (frame: IMessage) => {
          try {
            const event = JSON.parse(frame.body) as ConsultationEvent;
            if (event.consultationId === consultationId) onEventRef.current(event);
          } catch {
            // Ignore malformed live events; REST reconciliation remains authoritative.
          }
        });
        setStatus("connected");
        void onReconnectRef.current();
      },
      onStompError: () => {
        if (active) setStatus("disconnected");
      },
      onWebSocketError: () => {
        if (active) setStatus("disconnected");
      },
      onWebSocketClose: () => {
        if (active) setStatus("disconnected");
      },
    });

    client.activate();
    return () => {
      active = false;
      subscription?.unsubscribe();
      void client.deactivate();
    };
  }, [consultationId]);

  return status;
}
