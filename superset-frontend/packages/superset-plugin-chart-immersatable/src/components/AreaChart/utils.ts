const formatNumber = (
  rawValue: number | string,
  options?: Intl.NumberFormatOptions | undefined,
) => {
  const value = Number(rawValue);
  return Intl.NumberFormat('en', options).format(value);
};

export const toStandardAmount = (rawValue: number | string, decimals = 2) =>
  formatNumber(rawValue, {
    notation: 'standard',
    maximumFractionDigits: decimals,
  });
