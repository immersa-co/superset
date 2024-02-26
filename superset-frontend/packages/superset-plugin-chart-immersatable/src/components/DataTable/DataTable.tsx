/* eslint-disable theme-colors/no-literal-colors */
import React from 'react';
import { ColumnWithLooseAccessor, useSortBy, useTable } from 'react-table';
import { FixedSizeList as List } from 'react-window';
import { FaSortDown as FaSortDesc } from '@react-icons/all-files/fa/FaSortDown';
import { FaSortUp as FaSortAsc } from '@react-icons/all-files/fa/FaSortUp';
import { DataType } from '../../types';
import {
  TableCell,
  TableColumn,
  TableColumnText,
  TableHeader,
  TableHeaderGroup,
  TableRow,
} from './styledTable';

const DEFAULT_WIDTH = '100%';

export const DataTable = ({
  columns,
  processedData,
  height,
}: {
  columns: ColumnWithLooseAccessor<any>[];
  processedData: {
    [x: string]: any;
  }[];
  height: number;
}) => {
  const { headerGroups, rows, prepareRow, getTableProps, getTableBodyProps } =
    useTable<DataType>(
      {
        columns,
        data: processedData,
      },
      useSortBy,
    );

  return (
    <>
      <div {...getTableProps()}>
        {headerGroups.map(headerGroup => (
          <TableHeaderGroup
            {...headerGroup.getHeaderGroupProps()}
            key={headerGroup.id}
            style={{ width: DEFAULT_WIDTH }}
          >
            {headerGroup.headers.map(column => (
              <TableHeader key={column.id}>
                <div
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  style={{ display: 'flex' }}
                >
                  <TableColumn>
                    <TableColumnText style={{ width: DEFAULT_WIDTH }}>
                      {column.render('Header')}
                    </TableColumnText>
                    <span>
                      <div
                        style={{
                          display: 'flex',
                          position: 'relative',
                        }}
                      >
                        <FaSortAsc
                          style={{
                            height: '1.35rem',
                            width: '1.35rem',
                            color:
                              column.isSorted && !column.isSortedDesc
                                ? 'orange'
                                : 'gray',
                          }}
                        />
                        <FaSortDesc
                          style={{
                            height: '1.35rem',
                            width: '1.35rem',
                            color:
                              column.isSorted && column.isSortedDesc
                                ? 'orange'
                                : 'gray',
                            position: 'absolute',
                          }}
                        />
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
          width={DEFAULT_WIDTH}
        >
          {({ index, style }) => {
            const row = rows[index];
            prepareRow(row);
            return (
              <div style={style}>
                <TableRow
                  {...row.getRowProps()}
                  style={{ width: DEFAULT_WIDTH }}
                >
                  {row.cells.map(cell => (
                    <TableCell>{cell.render('Cell')}</TableCell>
                  ))}
                </TableRow>
              </div>
            );
          }}
        </List>
      </div>
    </>
  );
};
