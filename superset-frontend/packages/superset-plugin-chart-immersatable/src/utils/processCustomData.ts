type CustomData = {
  [key: string]: any;
};

const filterDataByDateInterval = (
  data: string,
  startDate: Date,
  endDate: Date,
) =>
  JSON.parse(data).filter((item: (string | number | Date)[]) => {
    const itemDate = new Date(item[0]);
    return itemDate >= startDate && itemDate <= endDate;
  });

export const processCustomData = (
  myData: CustomData[],
  timeRangeCols: string[],
  timeSinceUntil: {
    startDate: Date;
    endDate: Date;
  },
) => {
  const { startDate, endDate } = timeSinceUntil;
  return myData.map(customdata => {
    const updatedCustomdata = { ...customdata };
    const keysArray = Object.keys(updatedCustomdata);
    // eslint-disable-next-line no-restricted-syntax
    for (const item of keysArray) {
      const value = updatedCustomdata[item];
      if (
        timeRangeCols.includes(item) &&
        startDate &&
        endDate &&
        value?.toString().includes('[') &&
        Array.isArray(JSON.parse(value))
      ) {
        const filteredData = filterDataByDateInterval(
          value,
          startDate,
          endDate,
        );
        updatedCustomdata[item] = JSON.stringify(filteredData);
      }
    }
    return updatedCustomdata;
  });
};
