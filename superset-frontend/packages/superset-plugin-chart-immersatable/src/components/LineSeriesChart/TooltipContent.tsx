/* eslint-disable theme-colors/no-literal-colors */
import React, { memo } from 'react';
import { styled } from '@superset-ui/core';
import { timeFormat } from '@visx/vendor/d3-time-format';
import { ChartDataItem } from '../../types';

const ColoredSquare = styled.div`
  display: inline-block;
  width: 11px;
  height: 11px;
  margin-right: 8px;
  background: ${({ color }: { color: string }) => color};
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

const getDate = (datum: ChartDataItem) => new Date(datum.xAxis);

const formatDate = timeFormat("%b %d, '%y");

export interface ITooltipContentProps {
  accentColor: string;
  datum: ChartDataItem;
  yAxisValue: number | string;
}

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
