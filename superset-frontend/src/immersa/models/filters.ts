import { FilterGroupOperator, FilterOperator } from './enums';

export type LiveOpsFilterValueType = string | number | string[] | number[];

export type LiveOpsFilterOperator = {
  operator: FilterOperator;
  label: string;
  isPreset: boolean;
};

export type LiveOpsAppliedFilter = {
  id: string;
  field: string;
  operator: FilterOperator;
  value: LiveOpsFilterValueType;
};

export type LiveOpsEnrichedAppliedFilter = {
  fieldLabel: string;
  operatorLabel: string;
  isPreset: boolean;
} & LiveOpsAppliedFilter;

export interface NestedFilterCondition {
  id: string;
  operator: FilterGroupOperator | FilterOperator;
  conditions: (NestedFilterCondition | LiveOpsAppliedFilter)[];
}
