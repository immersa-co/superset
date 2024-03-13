import { ChartProps } from '@superset-ui/core';
import { getSinceUntil } from '../utils';
import { processColumns } from '../superset-core-utils';
import { DataType } from '../types';

export default function transformProps(chartProps: ChartProps) {
  const {
    width,
    height,
    formData,
    queriesData,
    emitCrossFilters,
    filterState,
  } = chartProps;

  const {
    boldText,
    headerFontSize,
    headerText,
    timeRange,
    timeRangeCols,
    allowRearrangeColumns,
    includeSearch,
    areaChartCols,
  } = formData;

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
    includeSearch,
    emitCrossFilters,
    filters: filterState.filters,
    areaChartCols,
  };
}
