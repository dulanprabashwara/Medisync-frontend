"use client";

import { useEffect, useRef, useState } from "react";
import type { ConsultationEvent } from "@/types/consultations";
import { sharedStompClient } from "@/lib/stomp-client";
import type { IMessage } from "@stomp/stompjs";

export type LiveConnectionStatus = "connecting" | "connected" | "disconnected";

export function useConsultationEvents(
  consultationId: string | undefined,
  onEvent: (event: ConsultationEvent) => void,
  onReconnect: () => void | Promise<void>,
) {
  const [status, setStatus] = useState<LiveConnectionStatus>("disconnected");
  const onEventRef = useRef(onEvent);
  const onReconnectRef = useRef(onReconnect);
  const previousStatusRef = useRef<LiveConnectionStatus>("disconnected");

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    if (!consultationId) return;
    
    let isSubscribed = true;

    // Start connection
    void sharedStompClient.connect();

    // Subscribe to status changes
    const unsubStatus = sharedStompClient.subscribeStatus((newStatus) => {
      if (!isSubscribed) return;
      setStatus(newStatus);
      
      if (previousStatusRef.current === "disconnected" && newStatus === "connected") {
        void onReconnectRef.current();
      }
      previousStatusRef.current = newStatus;
    });

    // Subscribe to events
    const unsubEvents = sharedStompClient.subscribe("/user/queue/consultation-events", (frame: IMessage) => {
      if (!isSubscribed) return;
      try {
        const event = JSON.parse(frame.body) as ConsultationEvent;
        if (event.consultationId === consultationId) {
          onEventRef.current(event);
        }
      } catch {
        // Ignore malformed live events
      }
    });

    return () => {
      isSubscribed = false;
      unsubEvents();
      unsubStatus();
      sharedStompClient.disconnect();
    };
  }, [consultationId]);

  return status;
}
