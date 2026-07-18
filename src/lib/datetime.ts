const MANILA_TIME_ZONE = "Asia/Manila";

const MANILA_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: MANILA_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Formats an instant as "DD/MM at HH:MM" in the fixed Asia/Manila time zone, regardless
 * of the server's own zone — used for the "Answered on ..." line in the manage area. */
export function formatAnsweredAtManila(date: Date): string {
  const parts = Object.fromEntries(
    MANILA_FORMATTER.formatToParts(date).map((p) => [p.type, p.value]),
  );
  return `${parts.day}/${parts.month} at ${parts.hour}:${parts.minute}`;
}
