/* eslint-disable theme-colors/no-literal-colors */
import React, { memo } from 'react';
import { AnimatedLineSeries, XYChart, Tooltip } from '@visx/xychart';
import { defaultStyles } from '@visx/tooltip';
import { styled } from '@superset-ui/core';
import { curveLinear } from '@visx/curve';
import { ChartData, ChartDataItem, ChartSeriesData } from '../../types';
import { TooltipContent } from './TooltipContent';

const trendingUpColor = '#65a30d';

const trendingDownColor = '#f43f5e';

const isUpwardTrend = (dataPoints: number[]) => {
  if (dataPoints.length < 2) return false;
  const { 0: first, [dataPoints.length - 1]: last } = dataPoints;
  return last >= first;
};

const accessors = {
  xAccessor: (datum: ChartDataItem) => datum.xAxis,
  yAccessor: (datum: ChartDataItem) => datum.yAxis,
};

export interface ILineSeriesChartProps {
  chartData: ChartData;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const ChartContainer = styled.div`
  rect {
    height: 70px;
    y: 10;
  }
  svg {
    display: flex;
    align-items: center;
  }
`;

export const LineSeriesChart = memo(
  ({
    chartData,
    height,
    margin = { top: 50, left: 5, right: 5, bottom: 50 },
  }: ILineSeriesChartProps) => {
    const isTrendingUp = isUpwardTrend(chartData.map(item => item.yAxis));
    const accentColor = isTrendingUp ? trendingUpColor : trendingDownColor;
    return (
      <ChartContainer>
        <XYChart
          margin={margin}
          height={height}
          xScale={{ type: 'band' }}
          yScale={{ type: 'linear' }}
        >
          <AnimatedLineSeries
            dataKey="Line 1"
            data={chartData}
            {...accessors}
            curve={curveLinear}
            stroke={accentColor}
          />

          <Tooltip<ChartDataItem>
            snapTooltipToDatumX
            snapTooltipToDatumY
            showVerticalCrosshair
            showSeriesGlyphs
            showDatumGlyph
            style={{
              ...defaultStyles,
              textAlign: 'center',
              backgroundColor: '#F8F8FF',
            }}
            renderTooltip={({ tooltipData }) => {
              const datum: ChartDataItem | ChartSeriesData | undefined =
                tooltipData?.nearestDatum?.datum;
              return (
                <TooltipContent
                  accentColor={accentColor}
                  datum={datum as ChartDataItem}
                  yAxisValue={accessors.yAccessor(datum as ChartDataItem)}
                />
              );
            }}
          />
        </XYChart>
      </ChartContainer>
    );
  },
);
