import { BE_OFFSET } from '../constants/thai-time';

/**
 * Converts Gregorian year to Buddhist Era year
 */
export function toBuddhistYear(gregorianYear: number): number {
  return gregorianYear + BE_OFFSET;
}

/**
 * Converts Buddhist Era year to Gregorian year
 */
export function toGregorianYear(buddhistYear: number): number {
  return buddhistYear - BE_OFFSET;
}

/**
 * Formats a date to Thai Buddhist Era format
 * @param date - ISO date string or Date object
 * @returns Formatted date string like "25 ก.พ. 2569"
 */
export function formatThaiDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate();
  const month = d.getMonth();
  const year = toBuddhistYear(d.getFullYear());

  const THAI_MONTHS = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  return `${day} ${THAI_MONTHS[month]} ${year}`;
}

/**
 * Gets the current date in Bangkok timezone (UTC+7)
 */
export function getBangkokDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
}

/**
 * Checks if it's a new day in Bangkok timezone
 */
export function isMidnightBangkok(): boolean {
  const bangkokDate = getBangkokDate();
  return bangkokDate.getHours() === 0 && bangkokDate.getMinutes() === 0;
}
