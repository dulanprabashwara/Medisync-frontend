import { useEffect, useRef, useState } from "react";
import type { IMessage } from "@stomp/stompjs";
import { sharedStompClient } from "@/lib/stomp-client";
import type { NotificationDTO } from "@/types/notification";

export function useNotificationEvents(
  onNotification: (notification: NotificationDTO) => void,
  onReconnect: () => void | Promise<void>,
) {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const onNotificationRef = useRef(onNotification);
  const onReconnectRef = useRef(onReconnect);
  const previousStatusRef = useRef<"connecting" | "connected" | "disconnected">("disconnected");

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    onReconnectRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    let isSubscribed = true;

    // Connect shared client
    void sharedStompClient.connect();

    const unsubStatus = sharedStompClient.subscribeStatus((newStatus) => {
      if (!isSubscribed) return;
      setStatus(newStatus);
      if (previousStatusRef.current === "disconnected" && newStatus === "connected") {
        void onReconnectRef.current();
      }
      previousStatusRef.current = newStatus;
    });

    const unsubEvents = sharedStompClient.subscribe("/user/queue/notifications", (frame: IMessage) => {
      if (!isSubscribed) return;
      try {
        const event = JSON.parse(frame.body) as NotificationDTO;
        onNotificationRef.current(event);
      } catch {
        // Safe ignore
      }
    });

    return () => {
      isSubscribed = false;
      unsubEvents();
      unsubStatus();
      sharedStompClient.disconnect();
    };
  }, []);

  return status;
}
