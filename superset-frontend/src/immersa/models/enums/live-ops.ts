/* eslint-disable import/prefer-default-export */
export enum FilterOperator {
  Equal = 'eq',
  LowerThan = 'lt',
  LowerThanEq = 'lte',
  GreaterThan = 'gt',
  GreaterThanEq = 'gte',
  BetweenNumbers = 'between_n',
  IsNull = 'null',
  IsNotNull = 'not_null',
  Is = 'is',
  Contains = 'contains',
  NotContains = 'not_contains',
  Includes = 'includes',
  Excludes = 'excludes',
  Before = 'before',
  After = 'after',
  Between = 'between',
  On = 'on',
  None = 'none',
}

export enum MetricType {
  Sessions = 'COUNT_DISTINCT_SESSIONS',
  Users = 'COUNT_DISTINCT_USERS',
  Events = 'COUNT_EVENTS',
  TrendTimeseries = 'TREND_TIMESERIES',
  AverageTimeseries = 'AVERAGE_TIMESERIES',
  MACDTimeseries = 'MACD_TIMESERIES',
  PercentileTimeseries = 'PERCENTILE_TIMESERIES',
  Sum = 'SUM_VALUES',
  Average = 'AVERAGE_VALUES',
  MathMetrics = 'MATH_METRICS',
  OrgToAccount = 'SUM_ORG_TO_ACCOUNT',
}

export enum MetricStatus {
  Pending = 'pending',
  Ready = 'ready',
}

export enum MetricTrackingStatus {
  Pending = 'pending',
  Ready = 'ready',
}

export enum MetricCalculationMethod {
  Sum = 'SUM',
  Average = 'AVG',
}

export enum MetricAggregationPeriod {
  AllTime = 'alltime',
  Month = 'month',
  Quarter = 'quarter',
  Today = 'today',
  Week = 'week',
  Year = 'year',
}

export enum MetricTrendMethod {
  Length = 'length',
  Slope = 'slope',
}

export enum MetricTrendCalculationData {
  FirstSpline = 'first-spline',
  LastSpline = 'last-spline',
  All = 'all',
}

export enum LiveOpsPrimaryEntity {
  Account = 'ACCOUNT',
  Organization = 'ORG',
}

export enum TimeseriesTimeframe {
  Today = 'today',
  Week = 'week',
  Month = 'month',
  Quarter = 'quarter',
  Year = 'year',
}

export enum FilterGroupOperator {
  AND = 'AND',
  OR = 'OR',
}
