/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable theme-colors/no-literal-colors */
import React, {
  CSSProperties,
  createRef,
  useMemo,
  useCallback,
  useState,
} from 'react';
import { DataRecordValue, t, tn } from '@superset-ui/core';
import { ColumnWithLooseAccessor } from 'react-table';
import {
  ChartData,
  SupersetPluginChartImmersatableProps,
  DataColumnMeta,
} from './types';
import { AreaChart, DataTable, LineSeriesChart } from './components';
import { Styles } from './Styles';
import { checkChartData, processCustomData } from './utils';
import { formatColumnValue, getSharedStyle } from './superset-core-utils';
import { SearchInputProps } from './components/DataTable/GlobalFilter';

const DEFAULT_WIDTH = '200px';

function SearchInput({ count, value, onChange }: SearchInputProps) {
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

export default function SupersetPluginChartImmersatable(
  props: SupersetPluginChartImmersatableProps,
) {
  const {
    data,
    height,
    width,
    timeRangeCols,
    timeSinceUntil,
    columns: columnsMeta,
    emitCrossFilters,
    filters,
    boldText,
    headerFontSize,
    headerText,
    allowRearrangeColumns = false,
    includeSearch = false,
    areaChartCols,
  } = props;

  const [columnOrderToggle, setColumnOrderToggle] = useState(false);

  const isActiveFilterValue = useCallback(
    (key: string, val: DataRecordValue) => filters?.[key]?.includes(val),
    [filters],
  );

  const getColumnConfigs = useCallback(
    (column: DataColumnMeta, i: number): ColumnWithLooseAccessor<any> => {
      const { key, label, isMetric, config = {} } = column;
      const columnWidth = Number.isNaN(Number(config.columnWidth))
        ? config.columnWidth
        : Number(config.columnWidth);

      const sharedStyle: CSSProperties = getSharedStyle(column);

      const className = emitCrossFilters && !isMetric ? ' dt-is-filter' : '';

      const { truncateLongCells } = config;

      const accessor = ((datum: { [x: string]: any }) => datum[key]) as never;

      const commonStyle = {
        width: columnWidth || DEFAULT_WIDTH,
        ...sharedStyle,
      };

      return {
        id: String(i),
        accessor,
        Cell: ({ value }: { value: DataRecordValue }) => {
          const formattedColumnValue = formatColumnValue(column, value);
          const text = formattedColumnValue[1];

          const cellProps = {
            // show raw number in title in case of numeric values
            title: typeof value === 'number' ? String(value) : undefined,
            className: [
              className,
              value == null ? 'dt-is-null' : '',
              isActiveFilterValue(key, value) ? ' dt-is-active-filter' : '',
            ].join(' '),
          };

          const isChartData = checkChartData(text);
          if (isChartData) {
            const chartData = JSON.parse(text).map((row: any) => ({
              xAxis: row[0],
              yAxis: row[1],
            }));

            const ChartComponent = areaChartCols.includes(label)
              ? AreaChart
              : LineSeriesChart;

            return (
              <div {...cellProps} style={commonStyle}>
                <ChartComponent
                  chartData={chartData as ChartData}
                  height={50}
                />
              </div>
            );
          }
          return (
            <div {...cellProps} style={commonStyle}>
              {truncateLongCells ? (
                <div
                  className="dt-truncate-cell"
                  style={columnWidth ? { width: columnWidth } : undefined}
                >
                  {text}
                </div>
              ) : (
                text
              )}
            </div>
          );
        },

        Header: ({ column: col, onClick, style, onDragStart, onDrop }) => (
          <div
            style={{
              width: columnWidth || DEFAULT_WIDTH,
              ...sharedStyle,
              ...style,
            }}
            onClick={onClick}
            data-column-name={col.id}
            {...(allowRearrangeColumns && {
              draggable: 'true',
              onDragStart,
              onDragOver: e => e.preventDefault(),
              onDragEnter: e => e.preventDefault(),
              onDrop,
            })}
          >
            {label}
          </div>
        ),
      };
    },
    [
      allowRearrangeColumns,
      areaChartCols,
      emitCrossFilters,
      isActiveFilterValue,
    ],
  );

  const columns = useMemo(
    () => columnsMeta.map(getColumnConfigs),
    [columnsMeta, getColumnConfigs],
  );

  const processedData = useMemo(
    () => processCustomData(data, timeRangeCols, timeSinceUntil),
    [data, timeSinceUntil, timeRangeCols],
  );

  const rootElem = createRef<HTMLDivElement>();

  return (
    <Styles
      ref={rootElem}
      boldText={boldText}
      headerFontSize={headerFontSize}
      height={height}
      width={width}
    >
      <DataTable
        columns={columns}
        processedData={processedData}
        onColumnOrderChange={() => setColumnOrderToggle(!columnOrderToggle)}
        searchInput={includeSearch && SearchInput}
        headerText={headerText}
      />
    </Styles>
  );
}
