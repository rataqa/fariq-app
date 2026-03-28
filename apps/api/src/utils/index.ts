import { addDays, format, lastDayOfMonth } from 'date-fns';
import { Request } from 'express';

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

export function makeDaysOfMonth(yyyy: string, mm: string): number[] {
  const firstDay = new Date(parseInt(yyyy), parseInt(mm) - 1, 1);
  const lastDay = lastDayOfMonth(firstDay);
  const daysOfMonth: number[] = [];

  let date = firstDay;
  while (date <= lastDay) {
    daysOfMonth.push(Number.parseInt(format(date, 'yyyyMMdd')));
    date = addDays(date, 1);
  }

  console.info({ daysOfMonth });
  return daysOfMonth;
}

export function isInMonth(yyyyMMdd: number, days: Record<string, unknown>) {
  const s = String(yyyyMMdd);
  return s in days;
}

export function dateDiffInHours(d1: string, d0: string) {
  const t1 = new Date(d1);
  const t0 = new Date(d0);
  const t0InSeconds = t0.getTime() / 1000;
  const t1InSeconds = t1.getTime() / 1000;
  return Math.round( 10.0 * (t1InSeconds - t0InSeconds) / 3600.0) / 10.0; // round to 2 decimal
}

export function deepClone<T = any>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(k => deepClone(obj[k])) as T; // pretending!
  } else if (typeof obj === 'object') {
    return JSON.parse(JSON.stringify(obj)) as T; // pretending!
  }
  return obj;
}

export function getTopAndSkipParams(reqQry: Request['query'], defaultTop = 100, maxTop = 100) {
  let $top = Number.parseInt(String(reqQry['$top']) || String(defaultTop));
  if (isNaN($top) || ($top <= 0) || (maxTop < $top)) $top = defaultTop;

  let $skip = Number.parseInt(String(reqQry['$skip']) || '0');
  if (isNaN($skip) || ($skip < 0)) $skip = 0;

  return { $top, $skip };
}

export function getYearAndMonthParams(
  reqParams: Request['params'],
  now = new Date(),
  currentYear = now.getFullYear(),
  currentMonth = now.getMonth() + 1,
  minYear = currentYear - 1,
) {
  const { yyyy = currentYear, mm = currentMonth } = reqParams;

  let year = Number.parseInt(`${yyyy}`);
  if (isNaN(year) || (year < minYear) || (currentYear < year)) year = currentYear;

  let month = Number.parseInt(`${mm}`);
  if (isNaN(month) || (month <= 0) || (12 < month)) month = currentMonth;

  return { year, yyyy: `${year}`, month, mm: `${month}` };
}

export function noOp() {}
