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
  myData: CustomData[],
  timeRangeCols: string[] = [],
  timeSinceUntil: {
    startDate: Date;
    endDate: Date;
  },
) => {
  const { startDate, endDate } = timeSinceUntil;
  return myData.map(customdata => {
    const updatedCustomData = { ...customdata };
    const keysArray = Object.keys(updatedCustomData);
    // eslint-disable-next-line no-restricted-syntax
    for (const item of keysArray) {
      const value = updatedCustomData[item];
      const isItemInTimeRangeCols = timeRangeCols.includes(item);
      const isDateRangeDefined = startDate && endDate;
      const isValueArrayString =
        typeof value === 'string' &&
        value.startsWith('[[') &&
        value.endsWith(']]');
      const parsedValue = isValueArrayString ? JSON.parse(value) : null;
      if (
        isItemInTimeRangeCols &&
        isDateRangeDefined &&
        isValueArrayString &&
        Array.isArray(parsedValue)
      ) {
        const filteredData = filterDataByDateInterval(
          parsedValue,
          startDate,
          endDate,
        );
        updatedCustomData[item] = JSON.stringify(filteredData);
      }
    }
    return updatedCustomData;
  });
};
