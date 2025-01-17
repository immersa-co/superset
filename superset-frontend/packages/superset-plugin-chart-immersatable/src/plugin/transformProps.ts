/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  ChartProps,
  extractTimegrain,
  getMetricLabel,
  TimeFormatter,
  GenericDataType,
  NumberFormatter,
  CurrencyFormatter,
  DataRecordValue,
  Currency,
  DataRecord,
  smartDateFormatter,
  getTimeFormatterForGranularity,
  getTimeFormatter,
  TimeFormats,
  getNumberFormatter,
  isEqualArray,
  ChartDataResponseResult,
  QueryFormData,
  QueryMode,
  QueryFormMetric,
  TimeGranularity,
  NumberFormats,
} from '@superset-ui/core';
import memoizeOne from 'memoize-one';
import { DataType } from '../types';
import { getSinceUntil } from '../utils';

const { PERCENT_3_POINT } = NumberFormats;
const { DATABASE_DATETIME } = TimeFormats;

type CustomFormatter = (value: DataRecordValue) => string;

export type TableColumnConfig = {
  d3NumberFormat?: string;
  d3SmallNumberFormat?: string;
  d3TimeFormat?: string;
  columnWidth?: number;
  horizontalAlign?: 'left' | 'right' | 'center';
  showCellBars?: boolean;
  alignPositiveNegative?: boolean;
  colorPositiveNegative?: boolean;
  truncateLongCells?: boolean;
  currencyFormat?: Currency;
};

export interface DataColumnMeta {
  // `key` is what is called `label` in the input props
  key: string;
  // `label` is verbose column name used for rendering
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
}

export type TableChartFormData = QueryFormData & {
  align_pn?: boolean;
  color_pn?: boolean;
  include_time?: boolean;
  include_search?: boolean;
  query_mode?: QueryMode;
  page_length?: string | number | null; // null means auto-paginate
  metrics?: QueryFormMetric[] | null;
  percent_metrics?: QueryFormMetric[] | null;
  timeseries_limit_metric?: QueryFormMetric[] | QueryFormMetric | null;
  groupby?: QueryFormMetric[] | null;
  all_columns?: QueryFormMetric[] | null;
  order_desc?: boolean;
  show_cell_bars?: boolean;
  table_timestamp_format?: string;
  time_grain_sqla?: TimeGranularity;
  column_config?: Record<string, TableColumnConfig>;
  allow_rearrange_columns?: boolean;
};
export interface TableChartProps extends ChartProps {
  ownCurrentState?: {
    pageSize?: number;
    currentPage?: number;
  };
  rawFormData: TableChartFormData;
  queriesData: ChartDataResponseResult[];
}

function isEqualColumns(propsA: TableChartProps[], propsB: TableChartProps[]) {
  const a = propsA[0];
  const b = propsB[0];
  return (
    a.datasource.columnFormats === b.datasource.columnFormats &&
    a.datasource.currencyFormats === b.datasource.currencyFormats &&
    a.datasource.verboseMap === b.datasource.verboseMap &&
    a.formData.tableTimestampFormat === b.formData.tableTimestampFormat &&
    a.formData.timeGrainSqla === b.formData.timeGrainSqla &&
    JSON.stringify(a.formData.columnConfig || null) ===
      JSON.stringify(b.formData.columnConfig || null) &&
    isEqualArray(a.formData.metrics, b.formData.metrics) &&
    isEqualArray(a.queriesData?.[0]?.colnames, b.queriesData?.[0]?.colnames) &&
    isEqualArray(a.queriesData?.[0]?.coltypes, b.queriesData?.[0]?.coltypes) &&
    JSON.stringify(a.formData.extraFilters || null) ===
      JSON.stringify(b.formData.extraFilters || null) &&
    JSON.stringify(a.formData.extraFormData || null) ===
      JSON.stringify(b.formData.extraFormData || null) &&
    JSON.stringify(a.rawFormData.column_config || null) ===
      JSON.stringify(b.rawFormData.column_config || null)
  );
}

function isNumeric(key: string, data: DataRecord[] = []) {
  return data.every(
    x => x[key] === null || x[key] === undefined || typeof x[key] === 'number',
  );
}

const processColumns = memoizeOne(function processColumns(
  props: TableChartProps,
) {
  const {
    datasource: { columnFormats, currencyFormats, verboseMap },
    rawFormData: {
      table_timestamp_format: tableTimestampFormat,
      metrics: metrics_,
      percent_metrics: percentMetrics_,
      column_config: columnConfig = {},
    },
    queriesData,
  } = props;
  const granularity = extractTimegrain(props.rawFormData);
  const { data: records, colnames, coltypes } = queriesData[0] || {};
  // convert `metrics` and `percentMetrics` to the key names in `data.records`
  const metrics = (metrics_ ?? []).map(getMetricLabel);
  const rawPercentMetrics = (percentMetrics_ ?? []).map(getMetricLabel);
  // column names for percent metrics always starts with a '%' sign.
  const percentMetrics = rawPercentMetrics.map((x: string) => `%${x}`);
  const metricsSet = new Set(metrics);
  const percentMetricsSet = new Set(percentMetrics);
  const rawPercentMetricsSet = new Set(rawPercentMetrics);

  const columns: DataColumnMeta[] = (colnames || [])
    .filter(
      key =>
        // if a metric was only added to percent_metrics, they should not show up in the table.
        !(rawPercentMetricsSet.has(key) && !metricsSet.has(key)),
    )
    .map((key: string, i) => {
      const dataType = coltypes[i];
      const config = columnConfig[key] || {};
      // for the purpose of presentation, only numeric values are treated as metrics
      // because users can also add things like `MAX(str_col)` as a metric.
      const isMetric = metricsSet.has(key) && isNumeric(key, records);
      const isPercentMetric = percentMetricsSet.has(key);
      const label =
        isPercentMetric && verboseMap?.hasOwnProperty(key.replace('%', ''))
          ? `%${verboseMap[key.replace('%', '')]}`
          : verboseMap?.[key] || key;
      const isTime = dataType === GenericDataType.Temporal;
      const isNumber = dataType === GenericDataType.Numeric;
      const savedFormat = columnFormats?.[key];
      const savedCurrency = currencyFormats?.[key];
      const numberFormat = config.d3NumberFormat || savedFormat;
      const currency = config.currencyFormat?.symbol
        ? config.currencyFormat
        : savedCurrency;

      let formatter;

      if (isTime || config.d3TimeFormat) {
        // string types may also apply d3-time format
        // pick adhoc format first, fallback to column level formats defined in
        // datasource
        const customFormat = config.d3TimeFormat || savedFormat;
        const timeFormat = customFormat || tableTimestampFormat;
        // When format is "Adaptive Formatting" (smart_date)
        if (timeFormat === smartDateFormatter.id) {
          if (granularity) {
            // time column use formats based on granularity
            formatter = getTimeFormatterForGranularity(granularity);
          } else if (customFormat) {
            // other columns respect the column-specific format
            formatter = getTimeFormatter(customFormat);
          } else if (isNumeric(key, records)) {
            // if column is numeric values, it is considered a timestamp64
            formatter = getTimeFormatter(DATABASE_DATETIME);
          } else {
            // if no column-specific format, print cell as is
            formatter = String;
          }
        } else if (timeFormat) {
          formatter = getTimeFormatter(timeFormat);
        }
      } else if (isPercentMetric) {
        // percent metrics have a default format
        formatter = getNumberFormatter(numberFormat || PERCENT_3_POINT);
      } else if (isMetric || (isNumber && (numberFormat || currency))) {
        formatter = currency
          ? new CurrencyFormatter({
              d3Format: numberFormat,
              currency,
            })
          : getNumberFormatter(numberFormat);
      }
      return {
        key,
        label,
        dataType,
        isNumeric: dataType === GenericDataType.Numeric,
        isMetric,
        isPercentMetric,
        formatter,
        config,
      };
    });
  return [metrics, percentMetrics, columns] as [
    typeof metrics,
    typeof percentMetrics,
    typeof columns,
  ];
},
isEqualColumns);

export default function transformProps(chartProps: ChartProps) {
  /**
   * This function is called after a successful response has been
   * received from the chart data endpoint, and is used to transform
   * the incoming data prior to being sent to the Visualization.
   *
   * The transformProps function is also quite useful to return
   * additional/modified props to your data viz component. The formData
   * can also be accessed from your SupersetPluginChartImmersatable.tsx file, but
   * doing supplying custom props here is often handy for integrating third
   * party libraries that rely on specific props.
   *
   * A description of properties in `chartProps`:
   * - `height`, `width`: the height/width of the DOM element in which
   *   the chart is located
   * - `formData`: the chart data request payload that was sent to the
   *   backend.
   * - `queriesData`: the chart data response payload that was received
   *   from the backend. Some notable properties of `queriesData`:
   *   - `data`: an array with data, each row with an object mapping
   *     the column/alias to its value. Example:
   *     `[{ col1: 'abc', metric1: 10 }, { col1: 'xyz', metric1: 20 }]`
   *   - `rowcount`: the number of rows in `data`
   *   - `query`: the query that was issued.
   *
   * Please note: the transformProps function gets cached when the
   * application loads. When making changes to the `transformProps`
   * function during development with hot reloading, changes won't
   * be seen until restarting the development server.
   */
  const {
    width,
    height,
    formData,
    queriesData,
    emitCrossFilters,
    filterState,
  } = chartProps;

  const { allow_rearrange_columns: allowRearrangeColumns } = formData;

  const { boldText, headerFontSize, headerText, timeRange, timeRangeCols } =
    formData;

  const [startDate, endDate] = getSinceUntil(timeRange.toLocaleLowerCase());

  const [metrics, percentMetrics, columns] = processColumns(chartProps as any);

  const data = queriesData[0].data as DataType[];

  return {
    width,
    height,
    data,
    // and now your control data, manipulated as needed, and passed through as props!
    boldText,
    headerFontSize,
    headerText,
    timeSinceUntil: {
      startDate,
      endDate,
    },
    timeRangeCols,
    metrics,
    percentMetrics,
    columns,
    allowRearrangeColumns,
    emitCrossFilters,
    filters: filterState.filters,
  };
}
