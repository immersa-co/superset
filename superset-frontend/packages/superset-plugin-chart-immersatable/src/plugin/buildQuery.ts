import { buildQueryContext, QueryFormData } from '@superset-ui/core';

export default function buildQuery(formData: QueryFormData) {
  const { cols: groupby } = formData;
  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      groupby,
    },
  ]);
}
