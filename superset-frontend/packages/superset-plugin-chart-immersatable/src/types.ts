import {
  QueryFormData,
  supersetTheme,
  DataRecordFilters,
  DataRecordValue,
  GenericDataType,
  TimeFormatter,
  NumberFormatter,
  CurrencyFormatter,
  Currency,
  SetDataMaskHook,
} from '@superset-ui/core';
import { ScaleOrdinal } from 'd3-scale';

export enum HorizontalAlign {
  Left = 'left',
  Right = 'right',
  Center = 'center',
}

export type SupersetPluginChartImmersatableStylesProps = {
  height: number;
  width: number;
  headerFontSize: keyof typeof supersetTheme.typography.sizes;
  boldText: boolean;
};

interface SupersetPluginChartHelloWorldCustomizeProps {
  headerText: string;
}

export type SupersetPluginChartHelloWorldQueryFormData = QueryFormData &
  SupersetPluginChartImmersatableStylesProps &
  SupersetPluginChartHelloWorldCustomizeProps;

type CustomFormatter = (value: DataRecordValue) => string;

export type TableColumnConfig = {
  d3NumberFormat?: string;
  d3SmallNumberFormat?: string;
  d3TimeFormat?: string;
  columnWidth?: number;
  horizontalAlign?: HorizontalAlign;
  showCellBars?: boolean;
  alignPositiveNegative?: boolean;
  colorPositiveNegative?: boolean;
  truncateLongCells?: boolean;
  currencyFormat?: Currency;
};
export type DataColumnMeta = {
  key: string;
  label: string;
  dataType: GenericDataType;
  formatter?:
    | TimeFormatter
    | NumberFormatter
    | CustomFormatter
    | CurrencyFormatter;
  isMetric?: boolean;
  isPercentMetric?: boolean;
  isNumeric?: boolean;
  config?: TableColumnConfig;
};

export type SupersetPluginChartImmersatableProps =
  SupersetPluginChartImmersatableStylesProps &
    SupersetPluginChartHelloWorldCustomizeProps & {
      data: DataType[];
      timeSinceUntil: {
        startDate: Date;
        endDate: Date;
      };
      timeRangeCols: string[];
      columns: DataColumnMeta[];
      emitCrossFilters?: boolean;
      allowRearrangeColumns?: boolean;
      filters?: DataRecordFilters;
      includeSearch?: boolean;
      areaChartCols: string[];
      rowCount?: number;
      serverPagination: boolean;
      serverPaginationData: { pageSize?: number; currentPage?: number };
      setDataMask: SetDataMaskHook;
      pageSize?: number;
    };

export type ChartDataItem = {
  xAxis: string | number;
  yAxis: number;
  seriesField?: string;
  colors?: ColorsVariants;
  color?: string;
  meta?: Record<string, string | number>;
};

export type ColorsVariants = {
  light: string;
  main: string;
  dark: string;
};

export type ChartData = ChartDataItem[];

export type ChartMargin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type DataType = Record<string, unknown>;

export type ChartSeriesData = {
  xAxis: string;
  labels?: { [serieKey: string]: string };
  colorScale?: ScaleOrdinal<string, ColorsVariants | string>;
} & { [serieKey: string]: number | string };
