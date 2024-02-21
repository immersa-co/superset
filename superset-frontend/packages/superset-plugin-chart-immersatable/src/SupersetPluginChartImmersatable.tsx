/* eslint-disable theme-colors/no-literal-colors */
import React, { createRef, useMemo } from 'react';
import { styled } from '@superset-ui/core';
import {
  useTable,
  Column,
  useSortBy,
  useBlockLayout,
  useResizeColumns,
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

const DEFAULT_COLUMN_MIN_WIDTH = 150;

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
  text-align: left;
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
  max-height: 5rem;
  text-align: left;
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
  const { data, height, width, timeRangeCols, timeSinceUntil } = props;

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

  const columnNames = useMemo(() => {
    if (myData && myData.length > 0) {
      return Object.keys(myData[0]);
    }
    return [];
  }, [myData]);

  const columnsMetadata = useMemo(
    () =>
      columnNames.map(metadata => ({
        width: DEFAULT_COLUMN_MIN_WIDTH,
        name: metadata,
        label: metadata,
        minWidth: null,
        maxWidth: null,
        sortable: true,
        sortDescFirst: true,
      })),
    [columnNames],
  );

  const columns: Column<DataType>[] = useMemo(
    () =>
      columnsMetadata.map(columnMetadata => ({
        Header: columnMetadata.label,
        accessor: columnMetadata.name,
        Cell: (info: any) => {
          const { value } = info;
          if (
            value?.toString().includes('[') &&
            Array.isArray(JSON.parse(value as string))
          ) {
            const chartData = JSON.parse(value).map((row: any) => ({
              xAxis: row[0],
              yAxis: row[1],
            }));
            return (
              // <TimeSeriesCell value="" chartData={chartData as ChartData} />
              <LineSeriesChart chartData={chartData as ChartData} />
            );
          }
          return value;
        },
      })),
    [columnsMetadata],
  );

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
                      <div style={{ padding: '0.475rem 1rem' }}>
                        {cell.render('Cell')}
                      </div>
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
