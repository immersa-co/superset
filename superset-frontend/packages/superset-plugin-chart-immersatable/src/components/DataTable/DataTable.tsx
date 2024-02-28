/* eslint-disable theme-colors/no-literal-colors */
import React from 'react';
import { ColumnWithLooseAccessor, useSortBy, useTable } from 'react-table';
import { FixedSizeList as List } from 'react-window';
import { FaSortDown as FaSortDesc } from '@react-icons/all-files/fa/FaSortDown';
import { FaSortUp as FaSortAsc } from '@react-icons/all-files/fa/FaSortUp';
import { TableStyles } from './table-styles';
import { TableHeaderIcon } from './TableHeaderIcon';
import { DataType } from '../../types';

const DEFAULT_WIDTH = '100%';

const defaultWidthStyle = { width: DEFAULT_WIDTH };

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
          <TableStyles.HeaderGroup
            {...headerGroup.getHeaderGroupProps()}
            key={headerGroup.id}
            style={defaultWidthStyle}
          >
            {headerGroup.headers.map(column => (
              <TableStyles.Header key={column.id}>
                <div {...column.getHeaderProps(column.getSortByToggleProps())}>
                  <TableStyles.Column>
                    <TableStyles.ColumnContent style={defaultWidthStyle}>
                      {column.render('Header')}
                    </TableStyles.ColumnContent>
                    <span>
                      <TableStyles.Icon>
                        <TableHeaderIcon
                          Icon={FaSortAsc}
                          isActive={column.isSorted && !column.isSortedDesc}
                          isAbsolute={false}
                        />
                        <TableHeaderIcon
                          Icon={FaSortDesc}
                          isActive={
                            (column.isSorted && column.isSortedDesc) || false
                          }
                          isAbsolute
                        />
                      </TableStyles.Icon>
                    </span>
                  </TableStyles.Column>
                </div>
              </TableStyles.Header>
            ))}
          </TableStyles.HeaderGroup>
        ))}
      </div>
      <div {...getTableBodyProps()}>
        <List
          height={height}
          itemCount={rows.length}
          itemSize={70}
          width={DEFAULT_WIDTH}
        >
          {({ index, style }) => {
            const row = rows[index];
            prepareRow(row);
            return (
              <div style={style}>
                <TableStyles.Row
                  {...row.getRowProps()}
                  style={defaultWidthStyle}
                >
                  {row.cells.map(cell => (
                    <TableStyles.Cell>{cell.render('Cell')}</TableStyles.Cell>
                  ))}
                </TableStyles.Row>
              </div>
            );
          }}
        </List>
      </div>
    </>
  );
};
