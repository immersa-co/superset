import React, { memo, CSSProperties, DragEvent } from 'react';
import { HeaderGroup } from 'react-table';
import { FaSortUp as FaSortAsc } from '@react-icons/all-files/fa/FaSortUp';
import { FaSortDown as FaSortDesc } from '@react-icons/all-files/fa/FaSortDown';
import { TableStyles } from './table-styles';
import { TableHeaderIcon } from './TableHeaderIcon';

interface HeaderGroupProps {
  headerGroups: any;
  defaultWidthStyle: CSSProperties;
  onDragStart: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}

export const HeaderGroups = memo(
  ({
    headerGroups,
    defaultWidthStyle,
    onDragStart,
    onDrop,
  }: HeaderGroupProps) => (
    <>
      {headerGroups.map((headerGroup: HeaderGroup<object>) => (
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
      ))}
    </>
  ),
);
