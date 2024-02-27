import React from 'react';
import { Group } from '@visx/group';
import { AreaClosed } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { curveMonotoneX } from '@visx/curve';
import { ScaleLinear, ScaleTime } from 'd3-scale';
import { ChartData, ChartMargin, ChartDataItem } from '../../types';

export type IAreaChartProps = {
  id: string;
  data: ChartData;
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
  gradientColor: string;
  margin: ChartMargin;
  getDate: (datum: ChartDataItem) => Date;
  getValue: (datum: ChartDataItem) => number;
};

export const AreaChartContent = ({
  id,
  gradientColor,
  margin,
  data,
  xScale,
  yScale,
  getDate,
  getValue,
}: IAreaChartProps) => (
  <Group left={margin.left}>
    <LinearGradient
      id={`${id}-chart-gradient`}
      from={gradientColor}
      to={gradientColor}
      fromOpacity={1}
      toOpacity={0.3}
    />
    <AreaClosed<ChartDataItem>
      data={data}
      x={datum =>
        (xScale as (arg: string | Date) => number)(getDate(datum)) ?? 0
      }
      y={datum => yScale?.(getValue(datum)) ?? 0}
      yScale={yScale as never}
      strokeWidth={1}
      stroke={`url(#${id}-chart-gradient)`}
      fill={`url(#${id}-chart-gradient)`}
      curve={curveMonotoneX}
    />
  </Group>
);
