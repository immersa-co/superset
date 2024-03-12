export const checkChartData = (cellValue: string) => {
  if (
    cellValue.startsWith('[[') &&
    cellValue.endsWith(']]') &&
    Array.isArray(JSON.parse(cellValue as string))
  ) {
    return true;
  }
  return false;
};
