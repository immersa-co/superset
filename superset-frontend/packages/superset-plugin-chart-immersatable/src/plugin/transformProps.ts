import { ChartProps } from '@superset-ui/core';
import { DataType } from '../types';
import { getSinceUntil, processColumns } from '../utils';

export default function transformProps(chartProps: ChartProps) {
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
