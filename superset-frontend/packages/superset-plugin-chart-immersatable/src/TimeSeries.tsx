import React, { memo, Suspense } from 'react';
import { ChartData } from './types';
import { CohortInlineTrackChart } from './InlineTrackChart';

export interface ITimeSeriesCellProps {
  value: string | number | null;
  chartData: ChartData;
}

export const TimeSeriesCell = memo(
  ({ value, chartData }: ITimeSeriesCellProps) => (
    <div style={{ width: '100%', height: '100%' }}>
      {value !== null && value !== undefined ? (
        <span className="text-left">{value}</span>
      ) : null}

      {chartData ? (
        <div style={{ width: '100%', height: '100%' }}>
          <Suspense fallback={null}>
            <CohortInlineTrackChart data={chartData} />
          </Suspense>
        </div>
      ) : null}
    </div>
  ),
);
