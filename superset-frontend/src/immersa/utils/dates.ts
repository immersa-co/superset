import {
  format,
  isValid,
  parse,
  parseISO,
  formatDistanceToNow,
} from 'date-fns';

export const formatISO = (date: string | Date, dateFormat: string) =>
  date instanceof Date
    ? format(date, dateFormat)
    : format(parseISO(date), dateFormat);

export const formatISOToLongDateTime = (date: string) =>
  formatISO(date, 'PPpp');

export const formatISOToShortDateTime = (date: string) => formatISO(date, 'Pp');

export const formatISOToShortDate = (date: string) => formatISO(date, 'Pp');

export const isValidISOString = (input: string) => isValid(parseISO(input));

export const formatISOToLongDate = (date: string) => formatISO(date, 'PP');

export const formatISOToHumanReadableDate = (
  date: string,
  { includeYear }: { includeYear: boolean } = { includeYear: true },
) => formatISO(date, `MMM d${includeYear ? ', yyyy' : ''}`);

export const formatToDateInput = (value: string) =>
  formatISO(value, 'yyyy-MM-dd');

export const formatISODistanceToNow = (isoDate: string) =>
  formatDistanceToNow(parseISO(isoDate), { addSuffix: true });

export const getCurrentTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const parseDateInputToDate = (
  value: string,
  parseFormat = 'yyyy-MM-dd',
) => parse(value, parseFormat, new Date());

export const parseISODateInputToDate = (value: string) => parseISO(value);

export const formatDateForChart = (
  value: string,
  { includeDay } = { includeDay: true },
) => formatISO(value, `MMM${includeDay ? ' d,' : ''} ''yy`);
