import { format, parseISO } from 'date-fns';
import moment, { Moment } from 'moment';

export const ChartAxisLabelColor = '#111827';

export const ChartAxisLineColor = '#d1d5db';

export const ChartGridLineColor = '#f3f4f6';

export const ChartSliderBorderPadding = 8;

export const ChartXYContainerDefaultMargin = {
  top: 0,
  right: 80,
  bottom: 25,
  left: 22,
};

export const ChartDefaultSeriesSecondaryColor = '#40A9FF';

export const ChartDefaultSeriesPrimaryColor = '#FA8C16';

export const ChartMaxTickLabelLength = 12;

export const ChartMaxXTicksCount = 15;

export const ChartYAxisLabelOffset = 30;

export const tickLongLabelProps = {
  overflow: 'hidden',
  textAnchor: 'end' as const,
  angle: 90,
  dy: '-0.5em',
  dx: '-0.3em',
  width: 120,
  height: 20,
};

const tickLabelBaseProps = {
  fontFamily: 'Inter',
  fontSize: 11,
  fontWeight: 400,
  fill: ChartAxisLabelColor,
};

export const ChartAxisBottomTickLongLabelProps = {
  ...tickLabelBaseProps,
  ...tickLongLabelProps,
  textAnchor: 'start' as const,
};

export const ChartAxisBottomTickLabelProps = {
  ...tickLabelBaseProps,
  textAnchor: 'middle' as const,
};

export const ChartAxisLeftTickLabelProps = {
  ...tickLabelBaseProps,
  dx: '-0.25em',
  dy: '0.25em',
  textAnchor: 'end' as const,
};

export const ChartGridBaseConfig = {
  lineStyle: { stroke: ChartGridLineColor },
  strokeWidth: 1,
};

export const ChartAxisBaseConfig = {
  stroke: ChartAxisLineColor,
  tickStroke: ChartAxisLineColor,
};

export const ChartLeftAxisBaseConfig = {
  ...ChartAxisBaseConfig,
  tickLabelProps: ChartAxisLeftTickLabelProps,
};

export const ChartBottomAxisBaseConfig = {
  ...ChartAxisBaseConfig,
  tickLabelProps: ChartAxisBottomTickLabelProps,
};

export const ChartBottomAxisLongLabelConfig = {
  ...ChartAxisBaseConfig,
  tickLabelProps: ChartAxisBottomTickLongLabelProps,
};

export const formatISO = (date: string | Date, dateFormat: string) =>
  date instanceof Date
    ? format(date, dateFormat)
    : format(parseISO(date), dateFormat);

export const formatDateForChart = (
  value: string,
  { includeDay } = { includeDay: true },
) => formatISO(value, `MMM${includeDay ? ' d,' : ''} ''yy`);

export const formatNumber = (
  rawValue: number | string,
  options?: Intl.NumberFormatOptions | undefined,
) => {
  const value = Number(rawValue);
  return Intl.NumberFormat('en', options).format(value);
};

export const toStandardAmount = (rawValue: number | string, decimals = 2) =>
  formatNumber(rawValue, {
    notation: 'standard',
    maximumFractionDigits: decimals,
  });

type MomentTuple = [moment.Moment | null, moment.Moment | null];

export function getSinceUntil(
  timeRange: string | null = null,
  relativeStart: string | null = null,
  relativeEnd: string | null = null,
): MomentTuple {
  const separator = ' : ';
  const effectiveRelativeStart = relativeStart || 'today';
  const effectiveRelativeEnd = relativeEnd || 'today';

  if (!timeRange) {
    return [null, null];
  }

  let modTimeRange: string | null = timeRange;

  if (timeRange === 'NO_TIME_RANGE' || timeRange === '_(NO_TIME_RANGE)') {
    return [null, null];
  }

  if (timeRange?.startsWith('last') && !timeRange.includes(separator)) {
    modTimeRange = timeRange + separator + effectiveRelativeEnd;
  }

  if (timeRange?.startsWith('next') && !timeRange.includes(separator)) {
    modTimeRange = effectiveRelativeStart + separator + timeRange;
  }

  if (
    timeRange?.startsWith('previous calendar week') &&
    !timeRange.includes(separator)
  ) {
    return [
      moment().subtract(1, 'week').startOf('week'),
      moment().startOf('week'),
    ];
  }

  if (
    timeRange?.startsWith('previous calendar month') &&
    !timeRange.includes(separator)
  ) {
    return [
      moment().subtract(1, 'month').startOf('month'),
      moment().startOf('month'),
    ];
  }

  if (
    timeRange?.startsWith('previous calendar year') &&
    !timeRange.includes(separator)
  ) {
    return [
      moment().subtract(1, 'year').startOf('year'),
      moment().startOf('year'),
    ];
  }

  const timeRangeLookup: Array<[RegExp, (...args: string[]) => Moment]> = [
    [
      /^last\s+(day|week|month|quarter|year)$/i,
      (unit: string) =>
        moment().subtract(1, unit as moment.unitOfTime.DurationConstructor),
    ],
    [
      /^last\s+([0-9]+)\s+(second|minute|hour|day|week|month|year)s?$/i,
      (delta: string, unit: string) =>
        moment().subtract(delta, unit as moment.unitOfTime.DurationConstructor),
    ],
    [
      /^next\s+([0-9]+)\s+(second|minute|hour|day|week|month|year)s?$/i,
      (delta: string, unit: string) =>
        moment().add(delta, unit as moment.unitOfTime.DurationConstructor),
    ],
    [
      // eslint-disable-next-line no-useless-escape
      /DATEADD\(DATETIME\("([^"]+)"\),\s*(-?\d+),\s*([^\)]+)\)/i,
      (timePart: string, delta: string, unit: string) => {
        if (timePart === 'now') {
          return moment().add(
            delta,
            unit as moment.unitOfTime.DurationConstructor,
          );
        }
        if (moment(timePart.toUpperCase(), true).isValid()) {
          return moment(timePart).add(
            delta,
            unit as moment.unitOfTime.DurationConstructor,
          );
        }
        return moment();
      },
    ],
  ];

  const sinceAndUntilPartition = modTimeRange
    .split(separator, 2)
    .map(part => part.trim());

  const sinceAndUntil: (Moment | null)[] = sinceAndUntilPartition.map(part => {
    if (!part) {
      return null;
    }

    let transformedValue: Moment | null = null;
    // Matching time_range_lookup
    const matched = timeRangeLookup.some(([pattern, fn]) => {
      const result = part.match(pattern);
      if (result) {
        transformedValue = fn(...result.slice(1));
        return true;
      }

      if (part === 'today') {
        transformedValue = moment().startOf('day');
        return true;
      }

      if (part === 'now') {
        transformedValue = moment();
        return true;
      }
      return false;
    });

    if (matched && transformedValue !== null) {
      // Handle the transformed value
    } else {
      // Handle the case when there was no match
      transformedValue = moment(`${part}`);
    }

    return transformedValue;
  });

  const [_since, _until] = sinceAndUntil;

  if (_since && _until && _since.isAfter(_until)) {
    throw new Error('From date cannot be larger than to date');
  }

  return [_since, _until];
}
