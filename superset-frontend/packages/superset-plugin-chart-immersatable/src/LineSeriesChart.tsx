/* eslint-disable theme-colors/no-literal-colors */
import React, { memo } from 'react';
import { AnimatedLineSeries, XYChart, Tooltip } from '@visx/xychart';
import { timeFormat } from '@visx/vendor/d3-time-format';
import { defaultStyles } from '@visx/tooltip';
import { styled } from '@superset-ui/core';
import { ChartData, ChartDataItem } from './types';

const trendingUpColor = '#65a30d';

const trendingDownColor = '#f43f5e';

const isUpwardTrend = (dataPoints: number[]) => {
  if (dataPoints.length < 2) return false;
  const { 0: first, [dataPoints.length - 1]: last } = dataPoints;
  return last >= first;
};

const getDate = (datum: ChartDataItem) => new Date(datum.xAxis);

const formatDate = timeFormat("%b %d, '%y");

const accessors = {
  xAccessor: (datum: ChartDataItem) => datum.xAxis,
  yAccessor: (datum: ChartDataItem) => datum.yAxis,
};

const ChartContainer = styled.div`
  rect {
    height: 70px;
    y: 10;
  }
  svg {
    display: flex;
    align-items: center;
  }
  padding: 0.2rem 0.4rem;
`;

const ColoredSquare = styled.div`
  display: inline-block;
  width: 11px;
  height: 11px;
  margin-right: 8px;
  background: ${({ color }) => color};
  border-radius: 4px;
`;

const TooltipContainer = styled.div`
  padding: 2px 4px;
  font-size: 12px;
  border-radius: 4px;
  color: #222222;

  .date {
    font-size: 12px;
    margin-bottom: 8px;
    color: #222222;
    font-weight: 600;
  }
  .value {
    display: flex;
    align-items: center;
    font-weight: 400;
    color: #000000;
  }
`;

export interface ILineSeriesChartProps {
  chartData: ChartData;
}

export const LineSeriesChart = memo(({ chartData }: ILineSeriesChartProps) => {
  const isTrendingUp = isUpwardTrend(chartData.map(item => item.yAxis));
  const accentColor = isTrendingUp ? trendingUpColor : trendingDownColor;
  return (
    <ChartContainer>
      <XYChart
        height={102}
        xScale={{ type: 'band' }}
        yScale={{ type: 'linear' }}
        margin={{ top: 50, left: 5, right: 5, bottom: 50 }}
      >
        <AnimatedLineSeries
          dataKey="Line 1"
          data={chartData}
          {...accessors}
          stroke={accentColor}
        />

        <Tooltip<ChartDataItem>
          snapTooltipToDatumX
          snapTooltipToDatumY
          showVerticalCrosshair
          showSeriesGlyphs
          style={{
            ...defaultStyles,
            textAlign: 'center',
            backgroundColor: '#F8F8FF',
          }}
          renderTooltip={({ tooltipData }) => {
            const { nearestDatum }: any = tooltipData;
            return (
              <TooltipContainer>
                <div className="row">
                  <div className="date">
                    {formatDate(getDate(nearestDatum.datum))}
                  </div>
                  <div className="value">
                    <ColoredSquare color={accentColor} />
                    <div style={{ fontWeight: '600' }}>
                      {accessors.yAccessor(nearestDatum.datum)}
                    </div>
                  </div>
                </div>
              </TooltipContainer>
            );
          }}
        />
      </XYChart>
    </ChartContainer>
  );
});
