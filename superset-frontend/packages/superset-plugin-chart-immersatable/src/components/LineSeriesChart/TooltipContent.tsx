/* eslint-disable theme-colors/no-literal-colors */
import React, { memo } from 'react';
import { timeFormat } from '@visx/vendor/d3-time-format';
import { ColoredSquare, TooltipContainer } from './ChartStyles';
import { ChartDataItem } from '../../types';

const getDate = (datum: ChartDataItem) => new Date(datum.xAxis);

const formatDate = timeFormat("%b %d, '%y");

export type ITooltipContentProps = {
  accentColor: string;
  datum: ChartDataItem;
  yAxisValue: number | string;
};

export const TooltipContent = memo(
  ({ accentColor, datum, yAxisValue }: ITooltipContentProps) => (
    <TooltipContainer>
      <div className="row">
        <div className="date">
          {formatDate(getDate(datum as ChartDataItem))}
        </div>
        <div className="value">
          <ColoredSquare color={accentColor} />
          <div style={{ fontWeight: '600' }}>{yAxisValue}</div>
        </div>
      </div>
    </TooltipContainer>
  ),
);
