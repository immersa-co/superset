import React from 'react';
import { t, tn } from '@superset-ui/core';
import { SearchInputProps } from './GlobalFilter';

export function SearchInput({ count, value, onChange }: SearchInputProps) {
  return (
    <span
      className="dt-global-filter"
      style={{ display: 'flex', alignItems: 'center' }}
    >
      {t('Search')}{' '}
      <input
        className="form-control input-sm"
        placeholder={tn('search.num_records', count)}
        value={value}
        onChange={onChange}
        style={{ marginLeft: '10px' }}
      />
    </span>
  );
}
