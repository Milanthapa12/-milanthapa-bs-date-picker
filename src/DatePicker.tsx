import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, Cross2Icon } from '@radix-ui/react-icons';
import * as bikramSambat from 'bikram-sambat';

type BsCalendarCell = {
  year: number;
  month: number;
  day: number;
  date: Date;
  isCurrentMonth: boolean;
};

type SelectionMode = 'date' | 'month' | 'year';

const SUPPORTED_DATE_FORMATS = [
  'YYYY-MM-DD',
  'YYYY/MM/DD',
  'YYYY.MM.DD',
  'DD-MM-YYYY',
  'DD/MM/YYYY',
  'DD.MM.YYYY',
  'MM-DD-YYYY',
  'MM/DD/YYYY',
  'MM.DD.YYYY'
] as const;

type SupportedDateFormat = (typeof SUPPORTED_DATE_FORMATS)[number];

function normalizeDateFormats(formats?: string | string[]) {
  if (!formats) return SUPPORTED_DATE_FORMATS;
  return (Array.isArray(formats) ? formats : [formats]).filter((format): format is SupportedDateFormat =>
    SUPPORTED_DATE_FORMATS.includes(format as SupportedDateFormat)
  );
}

function formatDateWithFormat(value: Date, format: string) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return format.replace('YYYY', String(year)).replace('MM', month).replace('DD', day);
}

function parseDateString(value: string, allowedFormats: readonly string[]) {
  const raw = value.split('·')[0].trim();
  if (!raw) return null;

  const match = raw.match(/^([0-9]{1,4})[-./]([0-9]{1,2})[-./]([0-9]{1,4})$/);
  if (!match) return null;

  for (const format of allowedFormats) {
    const sep = format.includes('-') ? '-' : format.includes('/') ? '/' : '.';
    const escapedSep = sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('^[0-9]{1,4}' + escapedSep + '[0-9]{1,2}' + escapedSep + '[0-9]{1,4}$');
    if (!regex.test(raw)) continue;

    const parts = raw.split(sep);
    const formatParts = format.split(/[-./]/);
    const fields: Record<string, number> = {};

    for (let index = 0; index < 3; index += 1) {
      const token = formatParts[index];
      const valuePart = parts[index];
      if (token === 'YYYY') fields.year = Number(valuePart);
      if (token === 'MM') fields.month = Number(valuePart);
      if (token === 'DD') fields.day = Number(valuePart);
    }

    if (
      fields.year === undefined ||
      fields.month === undefined ||
      fields.day === undefined ||
      fields.month < 1 || fields.month > 12 ||
      fields.day < 1 || fields.day > 31
    ) {
      continue;
    }

    const parsed = new Date(fields.year, fields.month - 1, fields.day);
    if (
      parsed.getFullYear() === fields.year &&
      parsed.getMonth() === fields.month - 1 &&
      parsed.getDate() === fields.day
    ) {
      return parsed;
    }
  }

  return null;
}

export interface DatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  locale?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  inputStyle?: React.CSSProperties;
  calendarClassName?: string;
  calendarStyle?: React.CSSProperties;
  minDate?: Date;
  maxDate?: Date;
  calendarType?: 'ad' | 'bs' | 'both';
  dateFormat?: string | string[];
  selectionMode?: SelectionMode;
}

const buttonBase =
  'inline-flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-900 shadow-sm transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400';

const iconButton =
  'inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50';

const popoverPanel =
  'z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg ring-1 ring-slate-900/5';

const dateButton =
  'inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-medium text-slate-700 transition-colors';

function clampDate(date: Date, minDate?: Date, maxDate?: Date) {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
}

const nepaliMonthNames = [
  'बैशाख',
  'जेठ',
  'असार',
  'श्रावण',
  'भदौ',
  'आश्विन',
  'कार्तिक',
  'मंसिर',
  'पुष',
  'माघ',
  'फाल्गुन',
  'चैत्र'
];

function toNepaliDigits(value: string | number) {
  const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(value).replace(/\d/g, (digit) => digits[Number(digit)]);
}

function formatDisplayDate(value: Date | null, locale: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(value);
}

function formatDateValue(
  value: Date | null,
  dateFormat: string | string[],
  locale: string,
  selectionMode: SelectionMode
) {
  if (!value) return '';
  if (selectionMode === 'year') {
    return String(value.getFullYear());
  }

  const formats = normalizeDateFormats(dateFormat);
  const format = formats.length ? formats[0] : 'YYYY-MM-DD';
  if (selectionMode === 'month') {
    const year = String(value.getFullYear());
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const sep = format.includes('-') ? '-' : format.includes('/') ? '/' : '.';
    const tokens = format.split(/[-./]/).filter((token) => token !== 'DD');
    return tokens
      .map((token) => {
        if (token === 'YYYY') return year;
        if (token === 'MM') return month;
        return '';
      })
      .join(sep);
  }

  return formatDateWithFormat(value, format);
}

function formatBsDate(value: Date | null, dateFormat: string | string[], selectionMode: SelectionMode) {
  if (!value) return '';
  const bs = adToBs(value);
  if (selectionMode === 'year') {
    return String(bs.year);
  }

  const formats = normalizeDateFormats(dateFormat);
  const format = formats.length ? formats[0] : 'YYYY-MM-DD';
  if (selectionMode === 'month') {
    const year = String(bs.year);
    const month = String(bs.month).padStart(2, '0');
    const sep = format.includes('-') ? '-' : format.includes('/') ? '/' : '.';
    const tokens = format.split(/[-./]/).filter((token) => token !== 'DD');
    return tokens
      .map((token) => {
        if (token === 'YYYY') return year;
        if (token === 'MM') return month;
        return '';
      })
      .join(sep);
  }

  const year = String(bs.year);
  const month = String(bs.month).padStart(2, '0');
  const day = String(bs.day).padStart(2, '0');
  return format.replace('YYYY', year).replace('MM', month).replace('DD', day);
}

const MS_PER_DAY = 86400000;
const BS_YEAR_ZERO = 2000;
// 1 बैशाख २००० BS = 1943-04-14 AD
const BS_EPOCH_TS = -843177600000;
const BS_MONTH_DATA: Record<number, number[]> = {
  2000: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2001: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2002: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2003: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2004: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2005: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2006: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2007: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2008: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2009: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2010: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2011: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2012: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2013: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2014: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2015: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2016: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2017: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2018: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2019: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2020: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2021: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2022: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2023: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2024: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2025: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2026: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2027: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2028: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2029: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2030: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2031: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2032: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2033: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2034: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2035: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2036: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2037: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2038: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2039: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2040: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2041: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2042: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2043: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2044: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2045: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2046: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2047: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2048: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2049: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2050: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2051: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2052: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2053: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2054: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2055: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2056: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2057: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2058: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2059: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2060: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2061: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2062: [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
  2063: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2064: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2065: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2066: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2067: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2068: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2069: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2070: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2085: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2086: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2087: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2091: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2092: [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2093: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2094: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2095: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
  2096: [30, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2097: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2098: [31, 31, 32, 31, 31, 31, 29, 30, 29, 30, 29, 31],
  2099: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31]
};

function bsDaysInMonth(year: number, month: number) {
  const months = BS_MONTH_DATA[year];
  if (months) {
    if (month < 1 || month > 12) throw new Error('Invalid month value ' + month);
    return months[month - 1];
  }
  return bikramSambat.daysInMonth(year, month);
}

function bsDaysInYear(year: number) {
  const months = BS_MONTH_DATA[year];
  if (months) {
    return months.reduce((sum, value) => sum + value, 0);
  }
  return Array.from({ length: 12 }, (_, index) => bikramSambat.daysInMonth(year, index + 1)).reduce(
    (sum, value) => sum + value,
    0
  );
}

function bsToAd(bsYear: number, bsMonth: number, bsDay: number) {
  const maxDay = bsDaysInMonth(bsYear, bsMonth);
  if (bsDay < 1 || bsDay > maxDay) {
    throw new Error('Invalid day value ' + bsDay);
  }

  let days = bsDay - 1;
  for (let year = BS_YEAR_ZERO; year < bsYear; year += 1) {
    days += bsDaysInYear(year);
  }
  for (let month = 1; month < bsMonth; month += 1) {
    days += bsDaysInMonth(bsYear, month);
  }

  return new Date(BS_EPOCH_TS + days * MS_PER_DAY);
}

function adToBs(date: Date) {
  let remaining = Math.floor((date.getTime() - BS_EPOCH_TS) / MS_PER_DAY) + 1;
  let year = BS_YEAR_ZERO;

  while (true) {
    const yearDays = bsDaysInYear(year);
    if (remaining <= yearDays) break;
    remaining -= yearDays;
    year += 1;
  }

  let month = 1;
  while (true) {
    const monthDays = bsDaysInMonth(year, month);
    if (remaining <= monthDays) break;
    remaining -= monthDays;
    month += 1;
  }

  return { year, month, day: remaining };
}

function getGridDates(currentMonth: Date) {
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();

  const weeks: Date[][] = [];
  let dayCounter = 1;
  let nextMonthDay = 1;

  for (let week = 0; week < 6; week += 1) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day += 1) {
      const cellIndex = week * 7 + day;
      let date: Date;

      if (cellIndex < firstDayOfMonth) {
        date = new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() - 1,
          prevMonthLastDay - (firstDayOfMonth - cellIndex - 1)
        );
      } else if (cellIndex < firstDayOfMonth + daysInMonth) {
        date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayCounter);
        dayCounter += 1;
      } else {
        date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, nextMonthDay);
        nextMonthDay += 1;
      }

      days.push(date);
    }
    weeks.push(days);
  }

  return weeks;
}

function getBsGridDates(currentBsMonth: { year: number; month: number }) {
  const daysInMonth = bsDaysInMonth(currentBsMonth.year, currentBsMonth.month);
  const firstDayAd = bsToAd(currentBsMonth.year, currentBsMonth.month, 1);
  const firstDayOfMonth = firstDayAd.getDay();

  const prevMonth = currentBsMonth.month === 1
    ? { year: currentBsMonth.year - 1, month: 12 }
    : { year: currentBsMonth.year, month: currentBsMonth.month - 1 };
  const prevDaysInMonth = bsDaysInMonth(prevMonth.year, prevMonth.month);

  const weeks: BsCalendarCell[][] = [];
  let dayCounter = 1;
  let nextDayCounter = 1;

  for (let week = 0; week < 6; week += 1) {
    const days: Array<{ year: number; month: number; day: number; date: Date; isCurrentMonth: boolean }> = [];
    for (let day = 0; day < 7; day += 1) {
      let bsYear = currentBsMonth.year;
      let bsMonth = currentBsMonth.month;
      let bsDay = 1;
      let isCurrentMonth = false;

      const cellIndex = week * 7 + day;
      if (cellIndex < firstDayOfMonth) {
        bsMonth = prevMonth.month;
        bsYear = prevMonth.year;
        bsDay = prevDaysInMonth - (firstDayOfMonth - cellIndex - 1);
      } else if (cellIndex < firstDayOfMonth + daysInMonth) {
        bsDay = dayCounter;
        dayCounter += 1;
        isCurrentMonth = true;
      } else {
        bsMonth = currentBsMonth.month === 12 ? 1 : currentBsMonth.month + 1;
        bsYear = currentBsMonth.month === 12 ? currentBsMonth.year + 1 : currentBsMonth.year;
        bsDay = nextDayCounter;
        nextDayCounter += 1;
      }

      const ad = bsToAd(bsYear, bsMonth, bsDay);
      days.push({
        year: bsYear,
        month: bsMonth,
        day: bsDay,
        date: ad,
        isCurrentMonth
      });
    }
    weeks.push(days);
  }

  return weeks;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameBsMonth(date: Date, bsYear: number, bsMonth: number) {
  const bs = adToBs(date);
  return bs.year === bsYear && bs.month === bsMonth;
}

function isSameBsYear(date: Date, bsYear: number) {
  return adToBs(date).year === bsYear;
}

function isMonthInRange(year: number, month: number, minDate?: Date, maxDate?: Date) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  if (minDate && end < minDate) return false;
  if (maxDate && start > maxDate) return false;
  return true;
}

function isYearInRange(year: number, minDate?: Date, maxDate?: Date) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  if (minDate && end < minDate) return false;
  if (maxDate && start > maxDate) return false;
  return true;
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  label = 'Select date',
  placeholder = 'Select a date',
  locale = 'en-US',
  disabled = false,
  className = '',
  inputClassName = '',
  inputStyle,
  calendarClassName = '',
  calendarStyle,
  minDate,
  maxDate,
  calendarType = 'ad',
  dateFormat = 'YYYY-MM-DD',
  selectionMode = 'date'
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(value ?? defaultValue ?? null);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(selectedDate ?? new Date());
  const [currentBsMonth, setCurrentBsMonth] = React.useState<{ year: number; month: number }>(
    selectedDate ? adToBs(selectedDate) : adToBs(new Date())
  );
  const [inputValue, setInputValue] = React.useState('');

  const isBsCalendar = calendarType !== 'ad';
  const allowedFormats = normalizeDateFormats(dateFormat);
  const displayValue = React.useMemo(() => {
    if (!selectedDate) return '';
    const adText = formatDateValue(selectedDate, dateFormat, locale, selectionMode);
    if (calendarType === 'ad') {
      return adText;
    }
    const bsText = formatBsDate(selectedDate, dateFormat, selectionMode);
    return calendarType === 'bs' ? bsText : `${adText} · ${bsText}`;
  }, [calendarType, dateFormat, locale, selectedDate, selectionMode]);

  React.useEffect(() => {
    setInputValue(displayValue);
  }, [displayValue]);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedDate(value);
      if (value) {
        setCurrentMonth(value);
        setCurrentBsMonth(adToBs(value));
      }
    }
  }, [value]);

  const commitInputValue = (closeOnSuccess = false) => {
    const parsed = parseDateString(inputValue, allowedFormats);
    if (!parsed || disabled || !clampDate(parsed, minDate, maxDate)) {
      setInputValue(displayValue);
      return;
    }

    setSelectedDate(parsed);
    setInputValue(
      calendarType === 'ad'
        ? formatDateValue(parsed, dateFormat, locale, selectionMode)
        : calendarType === 'bs'
        ? formatBsDate(parsed, dateFormat, selectionMode)
        : `${formatDateValue(parsed, dateFormat, locale, selectionMode)} · ${formatBsDate(parsed, dateFormat, selectionMode)}`
    );
    setCurrentMonth(parsed);
    setCurrentBsMonth(adToBs(parsed));
    onChange?.(parsed);
    if (closeOnSuccess) {
      setOpen(false);
    }
  };

  const handleSelectDate = (
    date: Date,
    bsDate?: { year: number; month: number; day: number }
  ) => {
    const selected = bsDate ? bsToAd(bsDate.year, bsDate.month, bsDate.day) : date;
    if (!clampDate(selected, minDate, maxDate) || disabled) return;
    setSelectedDate(selected);
    setInputValue(
      calendarType === 'ad'
        ? formatDateValue(selected, dateFormat, locale, selectionMode)
        : calendarType === 'bs'
        ? formatBsDate(selected, dateFormat, selectionMode)
        : `${formatDateValue(selected, dateFormat, locale, selectionMode)} · ${formatBsDate(selected, dateFormat, selectionMode)}`
    );
    setCurrentMonth(selected);
    setCurrentBsMonth(adToBs(selected));
    onChange?.(selected);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    setInputValue('');
    onChange?.(null);
  };

  const weeks = React.useMemo<(Date[] | BsCalendarCell[])[]>(() => {
    if (selectionMode !== 'date') return [];
    return isBsCalendar ? getBsGridDates(currentBsMonth) : getGridDates(currentMonth);
  }, [currentBsMonth, currentMonth, isBsCalendar, selectionMode]);

  const monthLabel = React.useMemo(() => {
    if (selectionMode === 'year') {
      const year = isBsCalendar ? currentBsMonth.year : currentMonth.getFullYear();
      const start = year - 6;
      const end = year + 5;
      return `${start} – ${end}`;
    }

    if (selectionMode === 'month') {
      return isBsCalendar
        ? toNepaliDigits(currentBsMonth.year)
        : new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(currentMonth);
    }

    if (isBsCalendar) {
      return `${nepaliMonthNames[currentBsMonth.month - 1]} ${toNepaliDigits(currentBsMonth.year)}`;
    }

    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(currentMonth);
  }, [currentBsMonth, currentMonth, isBsCalendar, locale, selectionMode]);

  const nepaliWeekdaysShort = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'];

  const weekdays = React.useMemo(() => {
    if (isBsCalendar) {
      return nepaliWeekdaysShort;
    }

    const base = new Date(2024, 0, 7);
    return Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(
        new Date(base.getFullYear(), base.getMonth(), base.getDate() + index)
      )
    );
  }, [isBsCalendar, locale]);

  const currentYear = isBsCalendar ? currentBsMonth.year : currentMonth.getFullYear();
  const monthNames = isBsCalendar
    ? nepaliMonthNames
    : Array.from({ length: 12 }, (_, index) =>
        new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2024, index, 1))
      );
  const yearRange = Array.from({ length: 12 }, (_, index) => currentYear - 6 + index);

  const triggerRef = React.useRef<HTMLDivElement | null>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number>();

  React.useLayoutEffect(() => {
    if (!triggerRef.current) return;

    const updateWidth = () => {
      if (triggerRef.current) {
        setTriggerWidth(triggerRef.current.getBoundingClientRect().width);
      }
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, []);

  React.useLayoutEffect(() => {
    if (open && triggerRef.current) {
      setTriggerWidth(triggerRef.current.getBoundingClientRect().width);
    }
  }, [open]);

  return (
    <div className={className || 'w-full'}>
      <label className="block text-sm">{label}</label>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <div
            ref={triggerRef}
            className={`${buttonBase} ${inputClassName}`}
            style={inputStyle}
            aria-label={label}
            role="button"
          >
            <div className="flex min-w-0 flex-1 items-center gap-1 text-left">
              <CalendarIcon className="h-4 w-4 text-slate-500" />
              <input
                type="text"
                className="min-w-0 flex-1 bg-transparent text-left text-[12px] leading-5 text-slate-900 outline-none placeholder:text-slate-400"
                value={inputValue}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    commitInputValue(true);
                  }
                }}
                onBlur={() => {
                  commitInputValue(false);
                }}
              />
            </div>
            {selectedDate ? (
              <span
                role="button"
                tabIndex={0}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                onClick={(event) => {
                  event.stopPropagation();
                  handleClear();
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    handleClear();
                  }
                }}
                aria-label="Clear date"
              >
                <Cross2Icon className="h-4 w-4" />
              </span>
            ) : (
              <span className="inline-flex h-9 w-9 items-center justify-center text-transparent" aria-hidden="true">
                {' '}
              </span>
            )}
          </div>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            className={`${popoverPanel} ${calendarClassName}`}
            style={{ minWidth: triggerWidth, ...calendarStyle }}
          >
            <div className="flex items-center justify-between gap-2 pb-2">
              <button
                type="button"
                className={iconButton}
                aria-label="Previous"
                onClick={() => {
                  if (selectionMode === 'year') {
                    if (isBsCalendar) {
                      setCurrentBsMonth((month) => ({ year: month.year - 12, month: month.month }));
                    } else {
                      setCurrentMonth((current) => new Date(current.getFullYear() - 12, current.getMonth(), 1));
                    }
                    return;
                  }

                  if (selectionMode === 'month') {
                    if (isBsCalendar) {
                      setCurrentBsMonth((month) => ({ year: month.year - 1, month: month.month }));
                    } else {
                      setCurrentMonth((current) => new Date(current.getFullYear() - 1, current.getMonth(), 1));
                    }
                    return;
                  }

                  if (isBsCalendar) {
                    const previousMonth = currentBsMonth.month === 1
                      ? { year: currentBsMonth.year - 1, month: 12 }
                      : { year: currentBsMonth.year, month: currentBsMonth.month - 1 };
                    setCurrentBsMonth(previousMonth);
                  } else {
                    setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
                  }
                }}
              >
                <ChevronLeftIcon className="h-3 w-3" />
              </button>
              <div className="text-[10px] font-semibold leading-none text-slate-900">{monthLabel}</div>
              <button
                type="button"
                className={iconButton}
                aria-label="Next"
                onClick={() => {
                  if (selectionMode === 'year') {
                    if (isBsCalendar) {
                      setCurrentBsMonth((month) => ({ year: month.year + 12, month: month.month }));
                    } else {
                      setCurrentMonth((current) => new Date(current.getFullYear() + 12, current.getMonth(), 1));
                    }
                    return;
                  }

                  if (selectionMode === 'month') {
                    if (isBsCalendar) {
                      setCurrentBsMonth((month) => ({ year: month.year + 1, month: month.month }));
                    } else {
                      setCurrentMonth((current) => new Date(current.getFullYear() + 1, current.getMonth(), 1));
                    }
                    return;
                  }

                  if (isBsCalendar) {
                    const nextMonth = currentBsMonth.month === 12
                      ? { year: currentBsMonth.year + 1, month: 1 }
                      : { year: currentBsMonth.year, month: currentBsMonth.month + 1 };
                    setCurrentBsMonth(nextMonth);
                  } else {
                    setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
                  }
                }}
              >
                <ChevronRightIcon className="h-3 w-3" />
              </button>
            </div>

            {selectionMode === 'date' ? (
              <>
                <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-semibold uppercase text-slate-500">
                  {weekdays.map((weekday) => (
                    <div key={weekday}>{weekday}</div>
                  ))}
                </div>

                <div className="mt-1 grid grid-cols-7 gap-0.5">
                  {(weeks.flat() as Array<Date | BsCalendarCell>).map((cell) => {
                    const bsCell = isBsCalendar ? (cell as BsCalendarCell) : undefined;
                    const date = isBsCalendar ? bsCell!.date : (cell as Date);
                    const isCurrentMonth = isBsCalendar ? bsCell!.isCurrentMonth : date.getMonth() === currentMonth.getMonth();
                    const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                    const isToday = isSameDay(date, new Date());
                    const disabledDate = !isCurrentMonth || !clampDate(date, minDate, maxDate);
                    const displayDay = isBsCalendar ? toNepaliDigits(bsCell!.day) : date.getDate();

                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => handleSelectDate(date, isBsCalendar ? { year: bsCell!.year, month: bsCell!.month, day: bsCell!.day } : undefined)}
                        disabled={disabledDate}
                        className={`${dateButton} ${
                          isSelected ? 'bg-slate-900 text-white shadow-sm' : ''
                        } ${isToday ? 'border border-slate-300' : ''} ${
                          !isCurrentMonth ? 'text-slate-400' : ''
                        } ${disabledDate ? 'pointer-events-none opacity-40' : ''}`}
                      >
                        {displayDay}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : selectionMode === 'month' ? (
              <div className="mt-1 grid grid-cols-3 gap-1">
                {monthNames.map((monthName, index) => {
                  const selected = isBsCalendar
                    ? bsToAd(currentYear, index + 1, 1)
                    : new Date(currentYear, index, 1);
                  const isSelected = selectedDate
                    ? isBsCalendar
                      ? isSameBsMonth(selectedDate, currentYear, index + 1)
                      : selectedDate.getFullYear() === currentYear && selectedDate.getMonth() === index
                    : false;
                  const disabled = !clampDate(selected, minDate, maxDate);
                  return (
                    <button
                      key={`${currentYear}-${monthName}`}
                      type="button"
                      onClick={() => handleSelectDate(selected)}
                      disabled={disabled}
                      className={`${dateButton} ${
                        isSelected ? 'bg-slate-900 text-white shadow-sm' : ''
                      } ${disabled ? 'pointer-events-none opacity-40' : ''}`}
                    >
                      {monthName}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-1 grid grid-cols-4 gap-1">
                {yearRange.map((year) => {
                  const selected = isBsCalendar ? bsToAd(year, 1, 1) : new Date(year, 0, 1);
                  const isSelected = selectedDate
                    ? isBsCalendar
                      ? isSameBsYear(selectedDate, year)
                      : selectedDate.getFullYear() === year
                    : false;
                  const disabled = !clampDate(selected, minDate, maxDate);
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleSelectDate(selected)}
                      disabled={disabled}
                      className={`${dateButton} ${
                        isSelected ? 'bg-slate-900 text-white shadow-sm' : ''
                      } ${disabled ? 'pointer-events-none opacity-40' : ''}`}
                    >
                      {isBsCalendar ? toNepaliDigits(year) : year}
                    </button>
                  );
                })}
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
