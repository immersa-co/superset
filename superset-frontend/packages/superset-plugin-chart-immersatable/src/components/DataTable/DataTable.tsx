/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable theme-colors/no-literal-colors */
import React, { useMemo } from 'react';
import {
  ColumnWithLooseAccessor,
  useSortBy,
  useTable,
  useColumnOrder,
  PluginHook,
  useGlobalFilter,
  usePagination,
} from 'react-table';
import { FixedSizeList as List } from 'react-window';
import { FaSortDown as FaSortDesc } from '@react-icons/all-files/fa/FaSortDown';
import { FaSortUp as FaSortAsc } from '@react-icons/all-files/fa/FaSortUp';
import { TableStyles } from './table-styles';
import { TableHeaderIcon } from './TableHeaderIcon';
import { DataType } from '../../types';
import GlobalFilter, { GlobalFilterProps } from './GlobalFilter';
import { ContainerStyled, HeaderStyled } from '../../Styles';

const ITEM_SIZE = 70;
const DEFAULT_WIDTH = '100%';

const defaultWidthStyle = { width: DEFAULT_WIDTH };

export const DataTable = ({
  columns,
  processedData,
  onColumnOrderChange,
  searchInput = true,
  headerText,
}: {
  columns: ColumnWithLooseAccessor<any>[];
  processedData: {
    [x: string]: any;
  }[];
  onColumnOrderChange: () => void;
  searchInput?: boolean | GlobalFilterProps<any>['searchInput'];
  headerText: string;
}) => {
  const tableHooks: PluginHook<any>[] = [
    useGlobalFilter,
    useSortBy,
    usePagination,
    useColumnOrder,
  ].flat();

  const {
    headerGroups,
    rows,
    prepareRow,
    getTableProps,
    getTableBodyProps,
    setColumnOrder,
    allColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: { globalFilter: filterValue },
  } = useTable<DataType>(
    {
      columns,
      data: processedData,
    },
    ...tableHooks,
  );

  let columnBeingDragged = -1;
  const onDragStart = (e: React.DragEvent) => {
    const el = e.target as HTMLTableCellElement;
    columnBeingDragged = allColumns.findIndex(
      col => col.id === el.dataset.columnName,
    );
    e.dataTransfer.setData('text/plain', `${columnBeingDragged}`);
  };

  const onDrop = (e: React.DragEvent) => {
    const el = e.target as HTMLTableCellElement;
    const newPosition = allColumns.findIndex(
      col => col.id === el.dataset.columnName,
    );

    if (newPosition !== -1) {
      const currentCols = allColumns.map(c => c.id);
      const colToBeMoved = currentCols.splice(columnBeingDragged, 1);
      currentCols.splice(newPosition, 0, colToBeMoved[0]);
      setColumnOrder(currentCols);
      // toggle value in TableChart to trigger column width recalc
      onColumnOrderChange();
    }
    e.preventDefault();
  };

  const renderedHeaderGroups = useMemo(
    () =>
      headerGroups.map(headerGroup => (
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
                    {column.render('Header', {
                      key: column.id,
                      ...column.getSortByToggleProps(),
                      onDragStart,
                      onDrop,
                    })}
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
      )),
    [headerGroups, onDragStart, onDrop],
  );

  return (
    <>
      <div>
        {searchInput ? (
          <div className="col-sm-6" style={{ marginBottom: '5px' }}>
            <GlobalFilter<any>
              searchInput={
                typeof searchInput === 'boolean' ? undefined : searchInput
              }
              preGlobalFilteredRows={preGlobalFilteredRows}
              setGlobalFilter={setGlobalFilter}
              filterValue={filterValue}
            />
          </div>
        ) : null}
      </div>
      <ContainerStyled>
        <HeaderStyled>{headerText}</HeaderStyled>
        <div {...getTableProps()}>{renderedHeaderGroups}</div>
        <div {...getTableBodyProps()}>
          <List
            height={rows.length * ITEM_SIZE}
            itemCount={rows.length}
            itemSize={ITEM_SIZE}
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
      </ContainerStyled>
    </>
  );
};
