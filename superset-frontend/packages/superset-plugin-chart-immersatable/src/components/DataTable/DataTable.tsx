/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable theme-colors/no-literal-colors */
// TODO: refactor the whole component. It's too big and complex.
import React, { CSSProperties, useMemo, useRef, memo } from 'react';
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
import { ContainerStyled, HeaderStyled } from '../../Styles';
import SimplePagination from '../superset-core/Pagination';
import {
  GlobalFilterProps,
  SelectPageSizeProps,
  SizeOption,
} from '../superset-core';
import GlobalFilter from '../superset-core/GlobalFilter';
import SelectPageSize from '../superset-core/SelectPageSize';
import { PAGE_SIZE_OPTIONS } from '../../superset-core-utils';
// TODO: barrel import for all the superset-core folder

const ITEM_SIZE = 70;
const DEFAULT_WIDTH = '100%';

const defaultWidthStyle = { width: DEFAULT_WIDTH };

export const DataTable = memo(
  ({
    columns,
    processedData,
    onColumnOrderChange,
    searchInput = true,
    headerText,
    serverPagination,
    pageSizeOptions = PAGE_SIZE_OPTIONS,
    pageSize: initialPageSize = 0,
    rowCount,
    data,
    serverPaginationData,
    onServerPaginationChange,
    selectPageSize,
    maxPageItemCount = 9,
  }: {
    columns: ColumnWithLooseAccessor<any>[];
    processedData: {
      [x: string]: any;
    }[];
    onColumnOrderChange: () => void;
    searchInput?: boolean | GlobalFilterProps<any>['searchInput'];
    headerText: string;
    pageSizeOptions?: SizeOption[];
    serverPagination?: boolean;
    pageSize?: number;
    rowCount: number;
    data: DataType[];
    serverPaginationData: { pageSize?: number; currentPage?: number };
    onServerPaginationChange: (pageNumber: number, pageSize: number) => void;
    selectPageSize?: boolean | SelectPageSizeProps['selectRenderer'];
    maxPageItemCount?: number;
  }) => {
    const tableHooks: PluginHook<any>[] = [
      useGlobalFilter,
      useSortBy,
      usePagination,
      useColumnOrder,
    ].flat();

    const resultsSize = serverPagination ? rowCount : data.length;

    const hasPagination = initialPageSize > 0 && 1 > 0; // TODO: review th condition
    const hasGlobalControl = hasPagination || !!searchInput;

    const globalControlRef = useRef<HTMLDivElement>(null);
    const paginationRef = useRef<HTMLDivElement>(null);

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
      state: { pageIndex, pageSize, globalFilter: filterValue, sticky = {} },
      pageCount,
      gotoPage,
      setPageSize: setPageSize_,
    } = useTable<DataType>(
      {
        columns,
        data: processedData,
      },
      ...tableHooks,
    );
    // make setPageSize accept 0
    const setPageSize = (size: number) => {
      if (serverPagination) {
        onServerPaginationChange(0, size);
      }
      // keep the original size if data is empty
      if (size || resultsSize !== 0) {
        setPageSize_(size === 0 ? resultsSize : size);
      }
    };

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

    // TODO: headerGroups should be a separated component.
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

    // This code is taken from the superset-core library.
    const paginationStyle: CSSProperties = sticky.height
      ? {}
      : { visibility: 'hidden' };

    let resultPageCount = pageCount;
    let resultCurrentPageSize = pageSize;
    let resultCurrentPage = pageIndex;
    let resultOnPageChange: (page: number) => void = gotoPage;
    if (serverPagination) {
      const serverPageSize = serverPaginationData?.pageSize ?? initialPageSize;
      resultPageCount = Math.ceil(rowCount / serverPageSize);
      if (!Number.isFinite(resultPageCount)) {
        resultPageCount = 0;
      }
      resultCurrentPageSize = serverPageSize;
      const foundPageSizeIndex = pageSizeOptions.findIndex(
        ([option]) => option >= resultCurrentPageSize,
      );
      if (foundPageSizeIndex === -1) {
        resultCurrentPageSize = 0;
      }
      resultCurrentPage = serverPaginationData?.currentPage ?? 0;
      resultOnPageChange = (pageNumber: number) =>
        onServerPaginationChange(pageNumber, serverPageSize);
    }

    return (
      <>
        <div>
          {hasGlobalControl ? (
            <div ref={globalControlRef} className="form-inline dt-controls">
              <div className="row">
                <div className="col-sm-6">
                  {hasPagination ? (
                    <SelectPageSize
                      total={resultsSize}
                      current={resultCurrentPageSize}
                      options={pageSizeOptions}
                      selectRenderer={
                        typeof selectPageSize === 'boolean'
                          ? undefined
                          : selectPageSize
                      }
                      onChange={setPageSize}
                    />
                  ) : null}
                </div>
                {searchInput ? (
                  <div className="col-sm-6" style={{ marginBottom: '5px' }}>
                    <GlobalFilter<any>
                      searchInput={
                        typeof searchInput === 'boolean'
                          ? undefined
                          : searchInput
                      }
                      preGlobalFilteredRows={preGlobalFilteredRows}
                      setGlobalFilter={setGlobalFilter}
                      filterValue={filterValue}
                    />
                  </div>
                ) : null}
              </div>
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
                        <TableStyles.Cell>
                          {cell.render('Cell')}
                        </TableStyles.Cell>
                      ))}
                    </TableStyles.Row>
                  </div>
                );
              }}
            </List>
          </div>
        </ContainerStyled>

        <div>
          {hasPagination && resultPageCount > 1 ? (
            <SimplePagination
              ref={paginationRef}
              style={paginationStyle}
              maxPageItemCount={maxPageItemCount}
              pageCount={resultPageCount}
              currentPage={resultCurrentPage}
              onPageChange={resultOnPageChange}
            />
          ) : null}
        </div>
      </>
    );
  },
);
