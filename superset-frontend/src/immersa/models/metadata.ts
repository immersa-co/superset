import colors from 'tailwindcss/colors';

import { ColumnDataType, TimeseriesTimeframe } from './enums';

import { LiveOpsFilterOperator } from './filters';
import { LiveOpsSortType } from './sorting';

export const PaletteColors: Array<keyof typeof colors> = [
  'red',
  'sky',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
];

export const DEFAULT_PALETTE_COLOR = PaletteColors[1];

export type PaletteColor = typeof PaletteColors[number];

export type LiveOpsColumnsMetadata = {
  identifier: string;
  list: LiveOpsColumnMetadata[];
};

export enum AnonymizationType {
  None = 'none',
  Name = 'name',
  Email = 'email',
  Phone = 'phone',
  Company = 'company',
}

export enum TimeFormatType {
  Date = 'MM/dd/yyyy',
  DateTime = 'MM/dd/yyyy HH:mm',
  DateTimeWithSeconds = 'MM/dd/yyyy HH:mm:ss',
  DateTimeWithSecondsAndMilliseconds = 'MM/dd/yyyy HH:mm:ss.SSS',
  DateTimeWithSecondsAndMillisecondsAndTimezone = 'MM/dd/yyyy HH:mm:ss.SSS ZZZ',
  DateTimeWithTimezone = 'MM/dd/yyyy HH:mm ZZZ',
  Time = 'HH:mm',
  TimeWithSeconds = 'HH:mm:ss',
  TimeWithSecondsAndMilliseconds = 'HH:mm:ss.SSS',
  TimeWithSecondsAndMillisecondsAndTimezone = 'HH:mm:ss.SSS ZZZ',
  TimeWithTimezone = 'HH:mm ZZZ',
  DistanceToNow = 'distanceToNow',
}

export type LiveOpsColumnMetadata = {
  id: string;
  name: string;
  label: string;
  order: number;
  type: ColumnDataType;
  filters: LiveOpsFilterOperator[];
  source?: string;
  values?: string[];
  maxWidth?: number;
  width?: number;
  minWidth?: number;
  group?: string;
  tracked?: boolean;
  format?: string | TimeFormatType;
  sortable?: boolean;
  anonymize?: AnonymizationType;
  timeseriesTimeframe?: TimeseriesTimeframe;
  isNew?: boolean;
  isHidden?: boolean;
};

export type LiveOpsSortingMetadata = {
  default: LiveOpsSortType[];
};

export type LiveOpsColumnGroupMetadata = {
  name: string;
  header: string;
  group: string | null;
  color: PaletteColor | null;
  order: number | null;
};

export type LiveOpsMetadata = {
  columns: LiveOpsColumnsMetadata;
  sorting: LiveOpsSortingMetadata;
  groups?: LiveOpsColumnGroupMetadata[];
};
