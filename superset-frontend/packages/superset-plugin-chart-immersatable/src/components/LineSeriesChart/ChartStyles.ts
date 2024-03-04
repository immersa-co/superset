/* eslint-disable theme-colors/no-literal-colors */
import { styled } from '@superset-ui/core';

export const ChartContainer = styled.div`
  rect {
    height: 50px;
    y: 0;
  }
  svg {
    display: flex;
    align-items: center;
  }
`;

export const ColoredSquare = styled.div`
  display: inline-block;
  width: 11px;
  height: 11px;
  margin-right: 8px;
  background: ${({ color }: { color: string }) => color};
  border-radius: 4px;
`;

export const TooltipContainer = styled.div`
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
