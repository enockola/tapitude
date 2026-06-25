import { DateTime } from "luxon";

export const SCHEDULE_TIME_ZONE = "America/New_York";
export const SCHEDULE_TIME_ZONE_LABEL = "ET";

export function etInputToUtcDate(value?: string): Date | null {
  if (!value) {
    return null;
  }

  const etDateTime = DateTime.fromISO(value, {
    zone: SCHEDULE_TIME_ZONE
  });

  if (!etDateTime.isValid) {
    return null;
  }

  return etDateTime.toUTC().toJSDate();
}

/**
 * Convert Time in UTC to eastern time
 * @param value
 * @returns 
 */
export function toEtDateTimeInputValue(value?: Date | string | null): string {
  const dateTime = value
    ? DateTime.fromJSDate(new Date(value)).setZone(SCHEDULE_TIME_ZONE)
    : DateTime.now().setZone(SCHEDULE_TIME_ZONE);

  return dateTime.toFormat("yyyy-MM-dd'T'HH:mm");
}

/**
 * Convert Time in UTC to eastern time
 * @param value 
 * @returns 
 */
export function formatEtDateTime(value?: Date | string | null): string {
  if (!value) {
    return "No date";
  }

  return DateTime.fromJSDate(new Date(value))
    .setZone(SCHEDULE_TIME_ZONE)
    .toFormat("M/d/yyyy, h:mm a 'ET'");
}