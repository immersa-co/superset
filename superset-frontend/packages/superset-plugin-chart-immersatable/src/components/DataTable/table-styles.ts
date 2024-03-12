/* eslint-disable theme-colors/no-literal-colors */
import { styled } from '@superset-ui/core';

const baseStyles = styled.div`
  display: flex;
`;

export const TableIconStyled = styled(baseStyles)`
  position: relative;
`;

export const TableHeaderGroupStyled = styled(baseStyles)`
  background: #f9fafb;
`;
export const TableHeaderStyled = styled.div`
  position: relative;
  border: 1px solid #d1d5db;
  text-transform: capitalize;
  padding: 0.875rem;
  min-height: 45px;
  &:hover {
    background-color: #fee9cd;
  }
`;

export const TableColumnStyled = styled(baseStyles)`
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding-right: 5px;
`;

export const TableColumnContentStyled = styled.div`
  overflow-wrap: break-word;
  font-weight: bold;
`;

export const TableRowStyled = styled(baseStyles)`
  &:hover {
    background-color: #fff7ed;
  }
`;

export const TableCellStyled = styled(TableIconStyled)`
  flex-grow: 1;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  align-items: center;
  padding-left: 1rem;
  min-height: 70px;
`;

type ITableStyles = {
  HeaderGroup: typeof TableHeaderGroupStyled;
  Header: typeof TableHeaderStyled;
  Column: typeof TableColumnStyled;
  ColumnContent: typeof TableColumnContentStyled;
  Row: typeof TableRowStyled;
  Cell: typeof TableCellStyled;
  Icon: typeof TableIconStyled;
};

const TableStyles: ITableStyles = {
  HeaderGroup: TableHeaderGroupStyled,
  Header: TableHeaderStyled,
  Column: TableColumnStyled,
  ColumnContent: TableColumnContentStyled,
  Row: TableRowStyled,
  Cell: TableCellStyled,
  Icon: TableIconStyled,
};

export { TableStyles };
