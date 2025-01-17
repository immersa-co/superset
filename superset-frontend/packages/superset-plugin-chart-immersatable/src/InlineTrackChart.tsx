/* eslint-disable theme-colors/no-literal-colors */
/* eslint-disable react/jsx-props-no-spreading */
import React, { ComponentProps, ComponentType, memo, useMemo } from 'react';
import { scaleLinear, scaleTime } from '@visx/scale';
import { extent as d3Extent, max as d3Max } from 'd3-array';
import {
  useTooltip,
  defaultStyles,
  useTooltipInPortal,
  Tooltip,
} from '@visx/tooltip';
import { timeFormat } from '@visx/vendor/d3-time-format';
import { ParentSize } from '@visx/responsive';
import { AreaChart } from './AreaChart';
import { ChartData, ChartDataItem } from './types';
import { toStandardAmount } from './utils';

import { TinyTooltip } from './TinyTooltip';

const trendingUpColor = '#65a30d';

const trendingDownColor = '#f43f5e';

export interface ICohortInlineTrackChartProps {
  data: ChartData;
  height: number;
  width: number;
}

const isUpwardTrend = (dataPoints: number[]) => {
  if (dataPoints.length < 2) return false;

  const { 0: first, [dataPoints.length - 1]: last } = dataPoints;
  return last >= first;
};

const getValue = (datum: ChartDataItem) => datum.yAxis;

const formatValue = (datum: ChartDataItem) => toStandardAmount(datum.yAxis);

const getDate = (datum: ChartDataItem) => new Date(datum.xAxis);

const formatDate = timeFormat("%b %d, '%y");

export const withResponsive =
  (Component: ComponentType<any>) => (props: ComponentProps<any>) =>
    (
      <ParentSize debounceTime={10}>
        {({ width, height }) => (
          <Component width={width} height={height} {...props} />
        )}
      </ParentSize>
    );

const InlineTrackChart = withResponsive(
  ({ data, height, width }: ICohortInlineTrackChartProps) => {
    const margin = {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    };

    const { containerRef } = useTooltipInPortal({
      scroll: true,
    });

    const xMax = Math.max(width, 0);

    const yMax = Math.max(height, 0);

    const isTrendingUp = isUpwardTrend(data.map(item => item.yAxis));

    const accentColor = isTrendingUp ? trendingUpColor : trendingDownColor;

    const innerHeight = height - margin.top - margin.bottom;

    const yScale = useMemo(
      () =>
        scaleLinear({
          range: [yMax, 0],
          domain: [0, d3Max(data, getValue) || 0],
          nice: true,
        }),
      [data, yMax],
    );

    const xScale = useMemo(
      () =>
        scaleTime({
          range: [0, xMax],
          domain: d3Extent(data, getDate) as unknown as [Date, Date],
        }),
      [data, xMax],
    );

    const {
      hideTooltip,
      showTooltip,
      tooltipLeft = 0,
      tooltipTop = 0,
      tooltipData,
    } = useTooltip<ChartDataItem>();

    if (!data.length) return <span>-</span>;

    return (
      <div style={{ width: '100%', height: '100%' }} ref={containerRef}>
        <svg width={width} height={25}>
          <AreaChart
            id={Math.random().toString(36)}
            data={data}
            dataType="date"
            xField="xAxis"
            yField="yAxis"
            gradientColor={accentColor}
            fromOpacity={0.5}
            toOpacity={0.05}
            width={width}
            height={height}
            margin={margin}
            hideBottomAxis
            hideLeftAxis
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
            data={data}
          />
        </svg>

        {tooltipData && (
          <Tooltip
            top={innerHeight + margin.top - 14}
            left={tooltipLeft}
            style={{
              ...defaultStyles,
              minWidth: 72,
              textAlign: 'center',
              transform: 'translateX(-50%)',
              border: '1px solid #808080',
              zIndex: 9999,
            }}
          >
            {formatDate(getDate(tooltipData))}
            <div style={{ paddingTop: '7px', fontWeight: '600' }}>
              {formatValue(tooltipData)}
            </div>
          </Tooltip>
        )}
      </div>
    );
  },
);

export const CohortInlineTrackChart = memo(InlineTrackChart);
