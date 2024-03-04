/* eslint-disable theme-colors/no-literal-colors */
import React, { memo } from 'react';
import { IconType } from '@react-icons/all-files/lib';

export type ITableHeaderIconProps = {
  Icon: IconType;
  isActive: boolean;
  isAbsolute: boolean;
};

const variantStylesMap = {
  primary: '#f97316',
  secondary: '#6b7280',
};

export const TableHeaderIcon = memo(
  ({ Icon, isActive, isAbsolute }: ITableHeaderIconProps) => (
    <Icon
      style={{
        height: '1.35rem',
        width: '1.35rem',
        color: isActive ? variantStylesMap.primary : variantStylesMap.secondary,
        position: isAbsolute ? 'absolute' : undefined,
      }}
    />
  ),
);
