/* eslint-disable theme-colors/no-literal-colors */
import React, { CSSProperties, createRef, useMemo, useCallback } from 'react';
import { styled, DataRecordValue } from '@superset-ui/core';
import {
  useTable,
  useSortBy,
  useBlockLayout,
  useResizeColumns,
  ColumnWithLooseAccessor,
} from 'react-table';
import { FixedSizeList as List } from 'react-window';
import {
  ChartData,
  DataType,
  SupersetPluginChartImmersatableProps,
  SupersetPluginChartImmersatableStylesProps,
} from './types';
import { LineSeriesChart } from './LineSeriesChart';
import { DataColumnMeta } from './plugin/transformProps';
import { checkChartData, formatColumnValue, processCustomData } from './utils';

const Styles = styled.div<SupersetPluginChartImmersatableStylesProps>`
  padding: ${({ theme }) => theme.gridUnit * 2}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  overflow: auto;
  h3 {
    /* You can use your props to control CSS! */
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: ${({ theme, headerFontSize }) =>
      theme.typography.sizes[headerFontSize]}px;
    font-weight: ${({ theme, boldText }) =>
      theme.typography.weights[boldText ? 'bold' : 'normal']};
  }

  pre {
    height: ${({ theme, headerFontSize, height }) =>
      height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]}px;
  }
`;

const ContainerStyle = styled.div`
  border: 1px solid #d1d5db;
  border-radius: 1rem;
  margin: 10px;
  width: fit-content;
  overflow: hidden;
  &:hover {
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
  }
`;

const HeaderText = styled.div`
  padding: 17px 24px;
  border: 1px solid #d1d5db;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  background: #f3f4f6;
  font-size: 1.4rem;
  font-weight: bold !important;
  color: rgb(107, 114, 128);
`;

const TableHeaderGroup = styled.div`
  display: flex;
  background: #f9fafb;
`;

const TableHeader = styled.div`
  display: flex;
  position: relative;
  border: 1px solid #d1d5db;
  text-transform: capitalize;
  padding: 0.875rem;
  min-height: 45px;
  &:hover {
    background-color: #fee9cd;
  }
`;

const TableColumn = styled.div`
  font-size: 0.875rem;
  line-height: 1.25rem;
  display: flex;
  padding-right: 5px;
`;

const TableColumnText = styled.div`
  overflow-wrap: break-word;
  width: 180px;
  font-weight: bold;
`;

const TableRow = styled.div`
  display: flex;
  &:hover {
    background-color: #fff7ed;
  }
`;

const TableCell = styled.div`
  flex-grow: 1;
  position: relative;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  min-height: 110px;
`;

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
  } = props;

  const getSharedStyle = (column: DataColumnMeta): CSSProperties => {
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

  const isActiveFilterValue = useCallback(
    function isActiveFilterValue(key: string, val: DataRecordValue) {
      return !!filters && filters[key]?.includes(val);
    },
    [filters],
  );

  const getColumnConfigs = useCallback(
    (column: DataColumnMeta, i: number): ColumnWithLooseAccessor<any> => {
      const { key, label, isMetric, config = {} } = column;
      const columnWidth = Number.isNaN(Number(config.columnWidth))
        ? config.columnWidth
        : Number(config.columnWidth);

      const sharedStyle: CSSProperties = getSharedStyle(column);

      let className = '';
      if (emitCrossFilters && !isMetric) {
        className += ' dt-is-filter';
      }

      const { truncateLongCells } = config;

      return {
        id: String(i),
        accessor: ((datum: { [x: string]: any }) => datum[key]) as never,
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
            return (
              <div
                {...cellProps}
                style={{
                  width: columnWidth || '200px',
                  ...sharedStyle,
                }}
              >
                <LineSeriesChart chartData={chartData as ChartData} />
              </div>
            );
          }
          return (
            <div
              {...cellProps}
              style={{
                width: columnWidth || '200px',
                ...sharedStyle,
              }}
            >
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

        Header: ({ style }) => (
          <div
            style={{ width: columnWidth || '200px', ...sharedStyle, ...style }}
          >
            {label}
          </div>
        ),
      };
    },
    [emitCrossFilters, isActiveFilterValue],
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

  const defaultColumn = useMemo(
    () => ({
      minWidth: 150,
      width: 200,
      maxWidth: 400,
    }),
    [],
  );

  const { headerGroups, rows, prepareRow, getTableProps, getTableBodyProps } =
    useTable<DataType>(
      {
        columns,
        data: processedData,
        defaultColumn,
      },
      useSortBy,
      useBlockLayout,
      useResizeColumns,
    );

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <ContainerStyle>
        <HeaderText>{props.headerText}</HeaderText>

        <div {...getTableProps()}>
          {headerGroups.map(headerGroup => (
            <TableHeaderGroup
              {...headerGroup.getHeaderGroupProps()}
              key={headerGroup.id}
              style={{ width: '100%' }}
            >
              {headerGroup.headers.map(column => (
                <TableHeader key={column.id}>
                  <div
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    style={{ display: 'flex' }}
                  >
                    <TableColumn>
                      <TableColumnText style={{ width: '100%' }}>
                        {column.render('Header')}
                      </TableColumnText>
                      <span>
                        <div
                          style={{
                            display: 'flex',
                            position: 'relative',
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            style={{
                              height: '1.35rem',
                              width: '1.35rem',
                              color:
                                column.isSorted && !column.isSortedDesc
                                  ? 'orange'
                                  : 'gray',
                            }}
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 15a.75.75 0 01-.75-.75V7.612L7.29 9.77a.75.75 0 01-1.08-1.04l3.25-3.5a.75.75 0 011.08 0l3.25 3.5a.75.75 0 11-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0110 15z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            style={{
                              height: '1.35rem',
                              width: '1.35rem',
                              color:
                                column.isSorted && column.isSortedDesc
                                  ? 'orange'
                                  : 'gray',
                              marginLeft: '0.4rem',
                              marginTop: '0.25rem',
                              position: 'absolute',
                            }}
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </span>
                    </TableColumn>
                  </div>
                </TableHeader>
              ))}
            </TableHeaderGroup>
          ))}
        </div>
        <div {...getTableBodyProps()}>
          <List
            height={height}
            itemCount={rows.length}
            itemSize={110}
            width="100%"
          >
            {({ index, style }) => {
              const row = rows[index];
              prepareRow(row);
              return (
                <div style={style}>
                  <TableRow {...row.getRowProps()} style={{ width: '100%' }}>
                    {row.cells.map(cell => (
                      <TableCell>{cell.render('Cell')}</TableCell>
                    ))}
                  </TableRow>
                </div>
              );
            }}
          </List>
        </div>
      </ContainerStyle>
    </Styles>
  );
}
