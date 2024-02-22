/* eslint-disable theme-colors/no-literal-colors */
import React, { CSSProperties, createRef, useMemo, useCallback } from 'react';
import { styled, DataRecordValue, t } from '@superset-ui/core';
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
// import { TimeSeriesCell } from './TimeSeries';
import { LineSeriesChart } from './LineSeriesChart';
import { DataColumnMeta } from './plugin/transformProps';
import { checkChartData, formatColumnValue } from './utils';

const ACTION_KEYS = {
  enter: 'Enter',
  spacebar: 'Spacebar',
  space: ' ',
};

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
    .resizer {
      display: inline-block;
      background: #fa8c16;
      width: 7px;
      height: 100%;
      position: absolute;
      right: 0;
      top: 0;
      transform: translateX(50%);
      z-index: 1;
      touch-action: none;
    }
    .isResizing {
      background: #fa8c16;
    }
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
  line-height: 1.25rem;
  min-height: 3rem;
`;

interface CustomData {
  [key: string]: any;
}

const filterDataByDateInterval = (
  data: string,
  startDate: Date,
  endDate: Date,
) =>
  JSON.parse(data).filter((item: (string | number | Date)[]) => {
    const itemDate = new Date(item[0]);
    return itemDate >= startDate && itemDate <= endDate;
  });

const processCustomData = (
  myData: CustomData[],
  timeRangeCols: string[],
  timeSinceUntil: {
    startDate: Date;
    endDate: Date;
  },
) => {
  const { startDate, endDate } = timeSinceUntil;
  return myData.map(customdata => {
    const updatedCustomdata = { ...customdata };
    const keysArray = Object.keys(updatedCustomdata);
    // eslint-disable-next-line no-restricted-syntax
    for (const item of keysArray) {
      const value = updatedCustomdata[item];
      if (
        timeRangeCols.includes(item) &&
        startDate &&
        endDate &&
        value?.toString().includes('[') &&
        Array.isArray(JSON.parse(value))
      ) {
        const filteredData = filterDataByDateInterval(
          value,
          startDate,
          endDate,
        );
        updatedCustomdata[item] = JSON.stringify(filteredData);
      }
    }
    return updatedCustomdata;
  });
};

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
    allowRearrangeColumns = false,
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
        id: String(i), // to allow duplicate column keys
        // must use custom accessor to allow `.` in column names
        // typing is incorrect in current version of `@types/react-table`
        // so we ask TS not to check.
        accessor: ((datum: { [x: string]: any }) => datum[key]) as never,
        Cell: ({ value }: { value: DataRecordValue }) => {
          const formattedColumnValue = formatColumnValue(column, value);
          const text = formattedColumnValue[1];
          let backgroundColor;
          const StyledCell = styled.td`
            text-align: ${sharedStyle.textAlign};
            white-space: ${value instanceof Date ? 'nowrap' : undefined};
            position: relative;
            background: ${backgroundColor || undefined};
          `;

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
              <LineSeriesChart chartData={chartData as ChartData} />
              // <StyledCell
              //   {...cellProps}
              //   style={{ minWidth: '200px', padding: '0.2rem 0.4rem' }}
              // >
              //   <LineSeriesChart chartData={chartData as ChartData} />
              // </StyledCell>
            );
          }
          return (
            <StyledCell
              {...cellProps}
              style={{ width: '200px', padding: '1.2rem 2rem' }}
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
            </StyledCell>
          );
        },

        Header: ({ column: col, onClick, style, onDragStart, onDrop }) => (
          <th
            title={t('Shift + Click to sort by multiple columns')}
            className={[className, col.isSorted ? 'is-sorted' : ''].join(' ')}
            style={{
              ...sharedStyle,
              ...style,
            }}
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
              // programatically sort column on keypress
              if (Object.values(ACTION_KEYS).includes(e.key)) {
                col.toggleSortBy();
              }
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
            {/* can't use `columnWidth &&` because it may also be zero */}
            {config.columnWidth ? (
              // column width hint
              <div
                style={{
                  width: columnWidth,
                  height: 0.01,
                }}
              />
            ) : null}
            <div
              data-column-name={col.id}
              css={{
                display: 'inline-flex',
                alignItems: 'flex-end',
              }}
            >
              <span
                data-column-name={col.id}
                style={{ overflowWrap: 'anywhere' }}
              >
                {label}
              </span>
            </div>
          </th>
        ),
      };
    },
    [allowRearrangeColumns, emitCrossFilters, isActiveFilterValue],
  );

  const columns = useMemo(
    () => columnsMeta.map(getColumnConfigs),
    [columnsMeta, getColumnConfigs],
  );

  const myData = useMemo(
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

  // const columnNames = useMemo(() => {
  //   if (myData && myData.length > 0) {
  //     return Object.keys(myData[0]);
  //   }
  //   return [];
  // }, [myData]);

  // const columnsMetadata = useMemo(
  //   () =>
  //     columnNames.map(metadata => ({
  //       width: DEFAULT_COLUMN_MIN_WIDTH,
  //       name: metadata,
  //       label: metadata,
  //       minWidth: null,
  //       maxWidth: null,
  //       sortable: true,
  //       sortDescFirst: true,
  //     })),
  //   [columnNames],
  // );

  // const columns: Column<DataType>[] = useMemo(
  //   () =>
  //     columnsMetadata.map(columnMetadata => ({
  //       Header: columnMetadata.label,
  //       accessor: columnMetadata.name,
  //       Cell: (info: any) => {
  //         const { value } = info;
  //         if (
  //           value?.toString().includes('[') &&
  //           Array.isArray(JSON.parse(value as string))
  //         ) {
  //           const chartData = JSON.parse(value).map((row: any) => ({
  //             xAxis: row[0],
  //             yAxis: row[1],
  //           }));
  //           return (
  //             // <TimeSeriesCell value="" chartData={chartData as ChartData} />
  //             <LineSeriesChart chartData={chartData as ChartData} />
  //           );
  //         }
  //         return value;
  //       },
  //     })),
  //   [columnsMetadata],
  // );

  const { headerGroups, rows, prepareRow, getTableProps, getTableBodyProps } =
    useTable<DataType>(
      {
        columns,
        data: myData,
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
                      <TableColumnText {...column.getHeaderProps()}>
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
                  <div
                    {...column.getResizerProps()}
                    className={`resizer ${
                      column.isResizing ? 'isResizing' : ''
                    }`}
                  />
                </TableHeader>
              ))}
            </TableHeaderGroup>
          ))}
        </div>
        <div {...getTableBodyProps()}>
          <List
            height={height - 50}
            itemCount={rows.length}
            itemSize={40}
            width="100%"
          >
            {({ index }) => {
              const row = rows[index];
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()} style={{ width: '100%' }}>
                  {row.cells.map(cell => (
                    <TableCell {...cell.getCellProps()}>
                      {/* <div style={{ padding: '0.475rem 1rem' }}> */}
                      {cell.render('Cell')}
                      {/* </div> */}
                    </TableCell>
                  ))}
                </TableRow>
              );
            }}
          </List>
        </div>
      </ContainerStyle>
    </Styles>
  );
}
