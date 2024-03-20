type CustomDataValue = string | number | Date;

type CustomDataArray = [Date, ...CustomDataValue[]];

type CustomData = {
  [key: string]: any;
};

const filterDataByDateInterval = (
  data: CustomDataArray[],
  startDate: Date,
  endDate: Date,
) =>
  data.filter((item: (string | number | Date)[]) => {
    const itemDate = new Date(item[0]);
    return itemDate >= startDate && itemDate <= endDate;
  });

export const processCustomData = (
  sourceData: CustomData[],
  timeRangeCols: string[] = [],
  timeSinceUntil: {
    startDate: Date;
    endDate: Date;
  },
) => {
  const { startDate, endDate } = timeSinceUntil;
  return sourceData.map(dataItem => {
    const updatedCustomData = { ...dataItem };
    const keysArray = Object.keys(updatedCustomData);
    // eslint-disable-next-line no-restricted-syntax
    for (const key of keysArray) {
      const propertyValue = updatedCustomData[key];
      const isTimeRangeColumn = timeRangeCols.includes(key);
      const hasDateRange = startDate && endDate;
      const isArrayString =
        typeof propertyValue === 'string' &&
        propertyValue.startsWith('[[') &&
        propertyValue.endsWith(']]');
      const parsedArray = isArrayString ? JSON.parse(propertyValue) : null;
      if (
        isTimeRangeColumn &&
        hasDateRange &&
        isArrayString &&
        Array.isArray(parsedArray)
      ) {
        const filteredData = filterDataByDateInterval(
          parsedArray,
          startDate,
          endDate,
        );
        updatedCustomData[key] = JSON.stringify(filteredData);
      }
    }
    return updatedCustomData;
  });
};
