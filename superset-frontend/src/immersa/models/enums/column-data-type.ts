/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
// eslint-disable-next-line import/prefer-default-export
export enum ColumnDataType {
  String = 'string',
  Email = 'email',
  Numeric = 'numeric',
  Timestamp = 'timestamp',
  Boolean = 'boolean',
  Enum = 'enum',
  TimeSeries = 'timeseries',
  Link = 'link',
  Default = 'default',
  Percentage = 'percentage',
}
export const getColumnDataTypesLabels = () => {
  let map = {};

  for (const enumMember in ColumnDataType) {
    const key = ColumnDataType[enumMember as keyof typeof ColumnDataType];
    map = { ...map, [key]: enumMember };
  }

  return map;
};
