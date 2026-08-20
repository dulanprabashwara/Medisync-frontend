import type { ConsultationMessage } from "@/types/consultations";

export function mergeConsultationMessages(
  current: ConsultationMessage[],
  incoming: ConsultationMessage[],
) {
  const byId = new Map(current.map((message) => [message.messageId, message]));
  incoming.forEach((message) => byId.set(message.messageId, message));
  return Array.from(byId.values()).sort((left, right) => {
    const timeDifference = new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime();
    return timeDifference || left.messageId.localeCompare(right.messageId);
  });
}
