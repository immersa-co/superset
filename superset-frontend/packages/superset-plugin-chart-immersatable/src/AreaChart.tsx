import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { AreaClosed } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { curveMonotoneX } from '@visx/curve';

import { ChartData, ChartMargin, ChartDataType, ChartDataItem } from './types';
import { useChartAccessorsAndScales } from './hooks';

export interface IAreaChartProps {
  id: string;
  data: ChartData;
  dataType?: ChartDataType;
  xField: string;
  yField: string;
  gradientColor: string;
  fromOpacity?: number;
  toOpacity?: number;
  width: number;
  height: number;
  margin: ChartMargin;
  top?: number;
  left?: number;
}

export const AreaChart = ({
  id,
  data,
  dataType = 'string',
  gradientColor,
  width,
  height,
  xField,
  yField,
  margin,
  fromOpacity = 1,
  toOpacity = 0.1,
  top,
  left,
}: IAreaChartProps) => {
  const bounds = useMemo(() => {
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    const chartHeight = innerHeight;

    const xMax = Math.max(innerWidth, 0);
    const yMax = Math.max(chartHeight, 0);

    return {
      xMax,
      yMax,
    };
  }, [height, margin, width]);

  const { getXAxisValue, getYAxisValue, xScale, yScale } =
    useChartAccessorsAndScales({
      data,
      dataType,
      xField,
      yField,
      width: bounds.xMax,
      height: bounds.yMax,
    });

  if (width < 10) return null;

  return (
    <Group left={left || margin.left} top={top || margin.top}>
      <LinearGradient
        id={`${id}-chart-gradient`}
        from={gradientColor}
        fromOpacity={fromOpacity}
        to={gradientColor}
        toOpacity={toOpacity}
      />

      <AreaClosed<ChartDataItem>
        data={data}
        x={datum =>
          (xScale as (arg: string | Date) => number)(getXAxisValue(datum)) || 0
        }
        y={datum => yScale?.(getYAxisValue(datum)) || 0}
        yScale={yScale as never}
        strokeWidth={1}
        stroke={`url(#${id}-chart-gradient)`}
        fill={`url(#${id}-chart-gradient)`}
        curve={curveMonotoneX}
      />
    </Group>
  );
};
