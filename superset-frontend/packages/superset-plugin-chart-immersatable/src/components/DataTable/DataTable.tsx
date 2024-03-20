/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable theme-colors/no-literal-colors */
import React, {
  CSSProperties,
  useMemo,
  useRef,
  memo,
  useCallback,
  useState,
} from 'react';
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
import { TableStyles } from './table-styles';
import { DataType } from '../../types';
import { ContainerStyled, HeaderStyled } from '../../Styles';
import {
  GlobalFilterProps,
  SizeOption,
  GlobalFilter,
  SelectPageSize,
  SimplePagination,
} from '../superset-core';
import { PAGE_SIZE_OPTIONS } from '../../superset-core-utils';
import { HeaderGroups } from './HeaderGroup';

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
    maxPageItemCount?: number;
  }) => {
    const [columnBeingDragged, setColumnBeingDragged] = useState(-1);

    const tableHooks: PluginHook<any>[] = [
      useGlobalFilter,
      useSortBy,
      usePagination,
      useColumnOrder,
    ].flat();

    const tableProperties = useMemo(() => {
      const resultsSize = serverPagination ? rowCount : data.length;
      const hasPagination = initialPageSize > 0 && resultsSize > 0;
      const hasGlobalControl = hasPagination || !!searchInput;

      return { resultsSize, hasPagination, hasGlobalControl };
    }, [serverPagination, rowCount, data.length, initialPageSize, searchInput]);

    const { resultsSize, hasPagination, hasGlobalControl } = tableProperties;

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
      setPageSize,
    } = useTable<DataType>(
      {
        columns,
        data: processedData,
      },
      ...tableHooks,
    );
    const updatePageSize = useCallback(
      (newSize: number) => {
        if (serverPagination) {
          onServerPaginationChange(0, newSize);
        }
        if (newSize || resultsSize !== 0) {
          setPageSize(newSize === 0 ? resultsSize : newSize);
        }
      },
      [serverPagination, onServerPaginationChange, resultsSize, setPageSize],
    );

    const onDragStart = useCallback(
      (e: React.DragEvent) => {
        const el = e.target as HTMLTableCellElement;
        const newColumnBeingDragged = allColumns.findIndex(
          col => col.id === el.dataset.columnName,
        );
        setColumnBeingDragged(newColumnBeingDragged);
        e.dataTransfer.setData('text/plain', `${newColumnBeingDragged}`);
      },
      [allColumns],
    );

    const onDrop = useCallback(
      (e: React.DragEvent) => {
        const el = e.target as HTMLTableCellElement;
        const newPosition = allColumns.findIndex(
          col => col.id === el.dataset.columnName,
        );
        if (newPosition !== -1) {
          const currentCols = allColumns.map(c => c.id);
          const colToBeMoved = currentCols.splice(columnBeingDragged, 1);
          currentCols.splice(newPosition, 0, colToBeMoved[0]);
          setColumnOrder(currentCols);
          onColumnOrderChange();
        }
        e.preventDefault();
      },
      [allColumns, columnBeingDragged, onColumnOrderChange],
    );

    const paginationStyle: CSSProperties = useMemo(
      () => (sticky.height ? {} : { visibility: 'hidden' }),
      [sticky.height],
    );

    const serverPageSize = useMemo(
      () => serverPaginationData?.pageSize ?? initialPageSize,
      [serverPaginationData],
    );

    const resultPageCount = useMemo(() => {
      if (serverPagination) {
        return Math.ceil(rowCount / serverPageSize);
      }
      return pageCount;
    }, [serverPagination, rowCount, serverPageSize, pageCount]);

    const resultCurrentPageSize = useMemo(() => {
      if (serverPagination) {
        const foundPageSizeIndex = pageSizeOptions.findIndex(
          ([option]) => option >= serverPageSize,
        );
        if (foundPageSizeIndex === -1) {
          return 0;
        }
        return serverPageSize;
      }
      return pageSize;
    }, [serverPagination, serverPageSize, pageSizeOptions, pageSize]);

    const resultCurrentPage = useMemo(
      () =>
        serverPagination ? serverPaginationData?.currentPage ?? 0 : pageIndex,
      [serverPagination, serverPaginationData, pageIndex],
    );

    const resultOnPageChange = useCallback(
      (pageNumber: number) => {
        if (serverPagination) {
          onServerPaginationChange(pageNumber, serverPageSize);
        } else {
          gotoPage(pageNumber);
        }
      },
      [serverPagination, onServerPaginationChange, serverPageSize, gotoPage],
    );

    return (
      <>
        {hasGlobalControl ? (
          <div ref={globalControlRef} className="form-inline dt-controls">
            <div className="row">
              <div className="col-sm-6">
                {hasPagination ? (
                  <SelectPageSize
                    current={resultCurrentPageSize}
                    options={pageSizeOptions}
                    onChange={updatePageSize}
                  />
                ) : null}
              </div>
              {searchInput ? (
                <div className="col-sm-6" style={{ marginBottom: '5px' }}>
                  <GlobalFilter
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
          </div>
        ) : null}
        <ContainerStyled>
          <HeaderStyled>{headerText}</HeaderStyled>
          <div {...getTableProps()}>
            <HeaderGroups
              headerGroups={headerGroups}
              defaultWidthStyle={defaultWidthStyle}
              onDragStart={onDragStart}
              onDrop={onDrop}
            />
          </div>
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
      </>
    );
  },
);
