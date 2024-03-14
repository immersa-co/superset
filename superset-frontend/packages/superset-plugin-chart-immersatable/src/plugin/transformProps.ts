import {
  ChartProps,
  DataRecord,
  GenericDataType,
  TimeFormatter,
  QueryMode,
} from '@superset-ui/core';
import memoizeOne from 'memoize-one';
import { getSinceUntil } from '../utils';
import { processColumns } from '../superset-core-utils';
import { DataColumnMeta } from '../types';
import DateWithFormatter from '../superset-core-utils/date-with-formatter';

const processDataRecords = memoizeOne(function processDataRecords(
  data: DataRecord[] | undefined,
  columns: DataColumnMeta[],
) {
  if (!data?.[0]) {
    return data || [];
  }
  const timeColumns = columns.filter(
    column => column.dataType === GenericDataType.TEMPORAL,
  );

  if (timeColumns.length > 0) {
    return data.map(x => {
      const datum = { ...x };
      timeColumns.forEach(({ key, formatter }) => {
        // Convert datetime with a custom date class so we can use `String(...)`
        // formatted value for global search, and `date.getTime()` for sorting.
        datum[key] = new DateWithFormatter(x[key], {
          formatter: formatter as TimeFormatter,
        });
      });
      return datum;
    });
  }
  return data;
});

/**
 * Automatically set page size based on number of cells.
 */
const getPageSize = (
  pageSize: number | string | null | undefined,
  numRecords: number,
  numColumns: number,
) => {
  if (typeof pageSize === 'number') {
    // NaN is also has typeof === 'number'
    return pageSize || 0;
  }
  if (typeof pageSize === 'string') {
    return Number(pageSize) || 0;
  }
  // when pageSize not set, automatically add pagination if too many records
  return numRecords * numColumns > 5000 ? 200 : 0;
};

const defaultServerPaginationData = {};
export default function transformProps(chartProps: ChartProps) {
  const {
    width,
    height,
    rawFormData: formData,
    queriesData = [],
    emitCrossFilters,
    filterState,
    ownState: serverPaginationData,
    hooks: { setDataMask = () => {} },
  } = chartProps;

  const {
    bold_text: boldText,
    header_font_size: headerFontSize,
    header_text: headerText,
    time_range: timeRange,
    time_range_cols: timeRangeCols,
    allow_rearrange_columns: allowRearrangeColumns,
    include_search: includeSearch = false,
    area_chart_cols: areaChartCols,
    server_pagination: serverPagination = false,
    server_page_length: serverPageLength = 10,
    page_length: pageLength,
    query_mode: queryMode,
    show_totals: showTotals,
  } = formData;

  const [startDate, endDate] = getSinceUntil(timeRange?.toLocaleLowerCase());

  const [metrics, percentMetrics, columns] = processColumns(chartProps as any);

  let baseQuery;
  let countQuery;
  let totalQuery;
  let rowCount;
  if (serverPagination) {
    [baseQuery, countQuery, totalQuery] = queriesData;
    rowCount = (countQuery?.data?.[0]?.rowcount as number) ?? 0;
  } else {
    [baseQuery, totalQuery] = queriesData;
    rowCount = baseQuery?.rowcount ?? 0;
  }

  const data = processDataRecords(baseQuery?.data, columns);
  const totals =
    showTotals && queryMode === QueryMode.aggregate
      ? totalQuery?.data[0]
      : undefined;

  console.log(
    'page size props',
    getPageSize(pageLength, data.length, columns.length),
  );

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
    includeSearch,
    emitCrossFilters,
    filters: filterState.filters,
    areaChartCols,
    serverPagination,
    serverPaginationData: serverPagination
      ? serverPaginationData
      : defaultServerPaginationData,
    pageSize: serverPagination
      ? serverPageLength
      : getPageSize(pageLength, data.length, columns.length),
    rowCount,
    setDataMask,
    totals,
  };
}
