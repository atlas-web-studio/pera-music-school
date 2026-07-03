export function formatTimeTo12Hour(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  const normalizedValue = value.trim();
  const match = normalizedValue.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    return normalizedValue;
  }

  const hours = Number(match[1]);
  const minutes = match[2];

  if (!Number.isInteger(hours) || hours < 0 || hours > 23) {
    return normalizedValue;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 || 12;

  return `${twelveHour}:${minutes} ${period}`;
}
