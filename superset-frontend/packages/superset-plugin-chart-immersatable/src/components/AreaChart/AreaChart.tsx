/* eslint-disable theme-colors/no-literal-colors */
import React, { useMemo, ComponentType, ComponentProps, memo } from 'react';
import { scaleTime, scaleLinear } from '@visx/scale';
import { withTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { extent } from 'd3-array';
import { ParentSize } from '@visx/responsive';
import { AreaChartContent } from './AreaChartContent';
import { TinyTooltip } from './TinyTooltip';
import { ChartData, ChartDataItem } from '../../types';
import { TooltipContent } from '../LineSeriesChart';

type TooltipData = ChartDataItem;

const trendingUpColor = '#65a30d';
const trendingDownColor = '#f43f5e';

const tooltipStyles = {
  ...defaultStyles,
  background: '#F8F8FF',
  border: '1px solid white',
  zIndex: 10,
};

const isUpwardTrend = (dataPoints: number[]) => {
  if (dataPoints.length < 2) return false;

  const { 0: first, [dataPoints.length - 1]: last } = dataPoints;
  return last >= first;
};

export type IAreaChartProps = {
  width: number;
  height: number;
  chartData: ChartData;
  margin?: { top: number; right: number; bottom: number; left: number };
};

const getValue = (datum: ChartDataItem) => datum.yAxis;
const getDate = (datum: ChartDataItem) => new Date(datum.xAxis);

export const withResponsive =
  (Component: ComponentType<any>) => (props: ComponentProps<any>) =>
    (
      <ParentSize debounceTime={10}>
        {({ width, height }) => (
          <Component width={width} height={height} {...props} />
        )}
      </ParentSize>
    );

const InlineAreaChart = withResponsive(
  withTooltip<IAreaChartProps, TooltipData>(
    ({
      chartData,
      width,
      height,
      margin = { top: 0, left: 0, right: 0, bottom: 0 },
      showTooltip,
      hideTooltip,
      tooltipData,
      tooltipTop = 0,
      tooltipLeft = 0,
    }: IAreaChartProps & WithTooltipProvidedProps<TooltipData>) => {
      if (width < 10) return null;

      const xMax = Math.max(width, 0);

      const yMax = Math.max(height, 0);

      const maxYValue = useMemo(() => {
        const allYValues = chartData.reduce((accumulator, datum) => {
          accumulator.push(datum.yAxis);
          return accumulator;
        }, [] as number[]);

        return Math.max(...allYValues);
      }, [chartData]);

      const isTrendingUp = isUpwardTrend(
        chartData.map(item => Number(item.yAxis)),
      );

      const accentColor = isTrendingUp ? trendingUpColor : trendingDownColor;

      const yScale = useMemo(
        () =>
          scaleLinear({
            range: [yMax, 0],
            domain: [0, maxYValue],
            nice: true,
          }),
        [yMax, maxYValue],
      );

      const xScale = useMemo(
        () =>
          scaleTime({
            range: [0, xMax],
            domain: extent(chartData, getDate) as [Date, Date],
          }),
        [chartData, xMax],
      );

      return (
        <div>
          <svg width={width} height={height}>
            <AreaChartContent
              id={Math.random().toString(36)}
              data={chartData}
              margin={margin}
              xScale={xScale}
              yScale={yScale}
              gradientColor={accentColor}
              getDate={getDate}
              getValue={getValue}
            />
            <TinyTooltip
              margin={margin}
              innerWidth={width}
              innerHeight={height}
              tooltipLeft={tooltipLeft}
              tooltipTop={tooltipTop}
              tooltipData={tooltipData as ChartDataItem}
              hideTooltip={hideTooltip}
              showTooltip={showTooltip}
              xScale={xScale}
              yScale={yScale}
              getDate={getDate}
              getValue={getValue}
              accentColor={accentColor}
              data={chartData}
            />
          </svg>

          {tooltipData && (
            <div>
              <TooltipWithBounds
                key={Math.random()}
                top={tooltipTop - 12}
                left={tooltipLeft + 12 + margin.left}
                style={tooltipStyles}
              >
                <TooltipContent
                  accentColor={accentColor}
                  datum={tooltipData as ChartDataItem}
                  yAxisValue={getValue(tooltipData)}
                />
              </TooltipWithBounds>
            </div>
          )}
        </div>
      );
    },
  ),
);

export const AreaChart = memo(InlineAreaChart);
