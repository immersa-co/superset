import {
  buildQueryContext,
  QueryObject,
  QueryMode,
  ensureIsArray,
  removeDuplicates,
  getMetricLabel,
  isPhysicalColumn,
  hasGenericChartAxes,
  AdhocColumn,
} from '@superset-ui/core';
import { PostProcessingRule } from '@superset-ui/core/src/query/types/PostProcessing';
import { BuildQuery } from '@superset-ui/core/src/chart/registries/ChartBuildQueryRegistrySingleton';
import { TableChartFormData } from '../superset-core-utils';
import { updateExternalFormData } from '../superset-core-utils/externalAPIs';

/**
 * Infer query mode from form data. If `all_columns` is set, then raw records mode,
 * otherwise defaults to aggregation mode.
 *
 * The same logic is used in `controlPanel` with control values as well.
 */
export function getQueryMode(formData: TableChartFormData) {
  const { query_mode: mode } = formData;
  if (mode === QueryMode.aggregate || mode === QueryMode.raw) {
    return mode;
  }
  const rawColumns = formData?.all_columns;
  const hasRawColumns = rawColumns && rawColumns.length > 0;
  return hasRawColumns ? QueryMode.raw : QueryMode.aggregate;
}

const buildQuery: BuildQuery<TableChartFormData> = (
  formData: TableChartFormData,
  options,
) => {
  const {
    percent_metrics: percentMetrics,
    order_desc: orderDesc = false,
    extra_form_data,
  } = formData;
  const queryMode = getQueryMode(formData);
  const sortByMetric = ensureIsArray(formData.timeseries_limit_metric)[0];
  const time_grain_sqla =
    extra_form_data?.time_grain_sqla || formData.time_grain_sqla;
  let formDataCopy = formData;
  // never include time in raw records mode
  if (queryMode === QueryMode.raw) {
    formDataCopy = {
      ...formData,
      include_time: false,
    };
  }

  formDataCopy.columns = formDataCopy.cols || [];
  console.log('formDataCopy:', formDataCopy);

  return buildQueryContext(formDataCopy, baseQueryObject => {
    console.log('baseQueryObject:', baseQueryObject);
    let { metrics, orderby = [], columns = [] } = baseQueryObject;
    let postProcessing: PostProcessingRule[] = [];

    if (queryMode === QueryMode.aggregate) {
      metrics = metrics || [];
      // override orderby with timeseries metric when in aggregation mode
      if (sortByMetric) {
        orderby = [[sortByMetric, !orderDesc]];
      } else if (metrics?.length > 0) {
        // default to ordering by first metric in descending order
        // when no "sort by" metric is set (regardless if "SORT DESC" is set to true)
        orderby = [[metrics[0], false]];
      }
      // add postprocessing for percent metrics only when in aggregation mode
      if (percentMetrics && percentMetrics.length > 0) {
        const percentMetricLabels = removeDuplicates(
          percentMetrics.map(getMetricLabel),
        );
        metrics = removeDuplicates(
          metrics.concat(percentMetrics),
          getMetricLabel,
        );
        postProcessing = [
          {
            operation: 'contribution',
            options: {
              columns: percentMetricLabels,
              rename_columns: percentMetricLabels.map(x => `%${x}`),
            },
          },
        ];
      }

      columns = columns.map(col => {
        if (
          isPhysicalColumn(col) &&
          time_grain_sqla &&
          hasGenericChartAxes &&
          formData?.temporal_columns_lookup?.[col]
        ) {
          return {
            timeGrain: time_grain_sqla,
            columnType: 'BASE_AXIS',
            sqlExpression: col,
            label: col,
            expressionType: 'SQL',
          } as AdhocColumn;
        }
        return col;
      });
    }

    const moreProps: Partial<QueryObject> = {};
    const ownState = options?.ownState ?? {};
    if (formDataCopy.server_pagination) {
      moreProps.row_limit =
        ownState.pageSize ?? formDataCopy.server_page_length;
      moreProps.row_offset =
        (ownState.currentPage ?? 0) * (ownState.pageSize ?? 0);
    }

    let queryObject = {
      ...baseQueryObject,
      columns,
      orderby,
      metrics,
      post_processing: postProcessing,
      ...moreProps,
    };

    if (
      formData.server_pagination &&
      options?.extras?.cachedChanges?.[formData.slice_id] &&
      JSON.stringify(options?.extras?.cachedChanges?.[formData.slice_id]) !==
        JSON.stringify(queryObject.filters)
    ) {
      queryObject = { ...queryObject, row_offset: 0 };
      updateExternalFormData(
        options?.hooks?.setDataMask,
        0,
        queryObject.row_limit ?? 0,
      );
    }
    // Because we use same buildQuery for all table on the page we need split them by id
    options?.hooks?.setCachedChanges({
      [formData.slice_id]: queryObject.filters,
    });

    const extraQueries: QueryObject[] = [];
    if (
      metrics?.length &&
      formData.show_totals &&
      queryMode === QueryMode.aggregate
    ) {
      extraQueries.push({
        ...queryObject,
        columns: [],
        row_limit: 0,
        row_offset: 0,
        post_processing: [],
        order_desc: undefined, // we don't need orderby stuff here,
        orderby: undefined, // because this query will be used for get total aggregation.
      });
    }

    const interactiveGroupBy = formData.extra_form_data?.interactive_groupby;
    if (interactiveGroupBy && queryObject.columns) {
      queryObject.columns = [
        ...new Set([...queryObject.columns, ...interactiveGroupBy]),
      ];
    }

    if (formData.server_pagination) {
      return [
        { ...queryObject },
        {
          ...queryObject,
          row_limit: 0,
          row_offset: 0,
          post_processing: [],
          is_rowcount: true,
        },
        ...extraQueries,
      ];
    }

    return [queryObject, ...extraQueries];
  });
};

// Use this closure to cache changing of external filters, if we have server pagination we need reset page to 0, after
// external filter changed
export const cachedBuildQuery = (): BuildQuery<TableChartFormData> => {
  let cachedChanges: any = {};
  const setCachedChanges = (newChanges: any) => {
    cachedChanges = { ...cachedChanges, ...newChanges };
  };

  return (formData, options) =>
    buildQuery(
      { ...formData },
      {
        extras: { cachedChanges },
        ownState: options?.ownState ?? {},
        hooks: {
          ...options?.hooks,
          setDataMask: () => {},
          setCachedChanges,
        },
      },
    );
};

export default cachedBuildQuery();
