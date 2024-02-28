/* eslint-disable theme-colors/no-literal-colors */
import React, { memo, useMemo } from 'react';
import { AnimatedLineSeries, XYChart, Tooltip } from '@visx/xychart';
import { defaultStyles } from '@visx/tooltip';
import { curveLinear } from '@visx/curve';
import { TooltipContent } from './TooltipContent';
import { ChartContainer } from './ChartStyles';
import { ChartData, ChartDataItem, ChartSeriesData } from '../../types';

const trendingUpColor = '#65a30d';

const trendingDownColor = '#f43f5e';

const tooltipStyles = {
  ...defaultStyles,
  textAlign: 'center' as const,
  backgroundColor: '#F8F8FF' as const,
};

const isUpwardTrend = (dataPoints: number[]) => {
  if (dataPoints.length < 2) return false;
  const { 0: first, [dataPoints.length - 1]: last } = dataPoints;
  return last >= first;
};

const dataAccessors = {
  xAccessor: (datum: ChartDataItem) => datum.xAxis,
  yAccessor: (datum: ChartDataItem) => datum.yAxis,
};

export type ILineSeriesChartProps = {
  chartData: ChartData;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
};

export const LineSeriesChart = memo(
  ({
    chartData,
    height,
    margin = { top: 50, left: 5, right: 5, bottom: 50 },
  }: ILineSeriesChartProps) => {
    const yMax = Math.max(height, 0);

    const maxYValue = useMemo(() => {
      const allYValues = chartData.reduce((accumulator, datum) => {
        accumulator.push(datum.yAxis);
        return accumulator;
      }, [] as number[]);

      return Math.max(...allYValues);
    }, [chartData]);

    const xScale = { type: 'band' };
    const yScale = useMemo(
      () => ({
        type: 'linear',
        range: [yMax, 0],
        domain: [0, maxYValue + 20],
      }),
      [maxYValue, yMax],
    );

    const isTrendingUp = isUpwardTrend(
      chartData.map(item => Number(item.yAxis)),
    );
    const accentColor = isTrendingUp ? trendingUpColor : trendingDownColor;
    return (
      <ChartContainer>
        <XYChart
          margin={margin}
          height={height}
          xScale={xScale as never}
          yScale={yScale as never}
        >
          <AnimatedLineSeries
            dataKey="Line 1"
            data={chartData}
            {...dataAccessors}
            curve={curveLinear}
            stroke={accentColor}
          />

          <Tooltip<ChartDataItem>
            snapTooltipToDatumX
            snapTooltipToDatumY
            showVerticalCrosshair
            showSeriesGlyphs
            showDatumGlyph
            style={tooltipStyles}
            renderTooltip={({ tooltipData }) => {
              const datum: ChartDataItem | ChartSeriesData | undefined =
                tooltipData?.nearestDatum?.datum;
              return (
                <TooltipContent
                  accentColor={accentColor}
                  datum={datum as ChartDataItem}
                  yAxisValue={dataAccessors.yAccessor(datum as ChartDataItem)}
                />
              );
            }}
          />
        </XYChart>
      </ChartContainer>
    );
  },
);
