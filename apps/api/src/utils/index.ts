import { addDays, format, lastDayOfMonth } from "date-fns";

export const base64 = {
  fromStr: (str: string) => Buffer.from(str, 'utf-8').toString('base64'),
};

const EMAIL_ADDRESS_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isEmailAddress(e: string) {
  return EMAIL_ADDRESS_PATTERN.test(e);
}

export async function waitForMs(ms = 200) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function makeDaysOfMonth<T = { count: number; text: string; }>(yyyy: string, mm: string, template: T): Record<string, T> {
  const firstDay = new Date(parseInt(yyyy), parseInt(mm) - 1, 1);
  const lastDay = lastDayOfMonth(firstDay);
  const daysOfMonth: Record<string, T> = {};

  let date = firstDay;
  while (date <= lastDay) {
    daysOfMonth[format(date, 'yyyyMMdd')] = template;
    date = addDays(date, 1);
  }

  console.info({ daysOfMonth });
  return daysOfMonth;
}

export function isInRange(yyyyMMdd: number, days: Record<string, unknown>) {
  const s = String(yyyyMMdd);
  return s in days;
}
