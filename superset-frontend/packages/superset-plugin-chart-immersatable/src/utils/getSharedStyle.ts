import { CSSProperties } from 'react';
import { DataColumnMeta } from '../types';

export const getSharedStyle = (column: DataColumnMeta): CSSProperties => {
  const { isNumeric, config = {} } = column;
  const textAlign = config.horizontalAlign
    ? config.horizontalAlign
    : isNumeric
    ? 'right'
    : 'left';
  return {
    textAlign,
  };
};
