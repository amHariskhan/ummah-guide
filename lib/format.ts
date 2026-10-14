const TIME_ZONE = "Asia/Karachi";

// Today → "3:45 PM", older → "14 Oct"
export function formatChatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();

  const day = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });

  if (day(date) === day(now)) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: TIME_ZONE,
    });
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: TIME_ZONE,
  });
}