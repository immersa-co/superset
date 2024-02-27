/* eslint-disable theme-colors/no-literal-colors */
import { styled } from '@superset-ui/core';

export const TableHeaderGroup = styled.div`
  display: flex;
  background: #f9fafb;
`;
export const TableHeader = styled.div`
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

export const TableColumn = styled.div`
  font-size: 0.875rem;
  line-height: 1.25rem;
  display: flex;
  padding-right: 5px;
`;

export const TableColumnText = styled.div`
  overflow-wrap: break-word;
  width: 180px;
  font-weight: bold;
`;

export const TableRow = styled.div`
  display: flex;
  &:hover {
    background-color: #fff7ed;
  }
`;

export const TableCell = styled.div`
  flex-grow: 1;
  position: relative;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  min-height: 70px;
`;
