import { LiveOpsPrimaryEntity } from './enums';
import { LiveOpsMetadata } from './metadata';

export type LiveOpsSegmentSpreadSheet = {
  sheetName?: string;
  sheetURL?: string;
};

export type LiveOpsSegment = {
  id: string;
  type: LiveOpsPrimaryEntity;
  tableName: string;
  name: string;
  label: string;
  order: number;
  disabled?: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  spreadsheet?: LiveOpsSegmentSpreadSheet;
} & LiveOpsMetadata;
