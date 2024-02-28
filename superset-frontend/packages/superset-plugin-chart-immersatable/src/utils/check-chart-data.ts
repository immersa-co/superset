export const checkChartData = (cellValue: string) => {
  if (
    cellValue?.toString().includes('[') &&
    Array.isArray(JSON.parse(cellValue as string))
  ) {
    return true;
  }
  return false;
};
