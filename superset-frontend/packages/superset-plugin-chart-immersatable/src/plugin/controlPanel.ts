import {
  t,
  validateNonEmpty,
  isFeatureEnabled,
  FeatureFlag,
} from '@superset-ui/core';
import {
  ControlPanelConfig,
  sharedControls,
  ControlPanelsContainerProps,
} from '@superset-ui/chart-controls';
import { PAGE_SIZE_OPTIONS } from '../consts';

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Query'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'cols',
            config: {
              ...sharedControls.groupby,
              label: t('Columns'),
              description: t('Columns to group by'),
              validators: [validateNonEmpty],
            },
          },
        ],
        [
          {
            name: 'metrics',
            config: {
              ...sharedControls.metrics,
              validators: [],
            },
          },
        ],
        ['adhoc_filters'],
        isFeatureEnabled(FeatureFlag.DASHBOARD_CROSS_FILTERS) ||
        isFeatureEnabled(FeatureFlag.DASHBOARD_NATIVE_FILTERS)
          ? [
              {
                name: 'server_pagination',
                config: {
                  type: 'CheckboxControl',
                  label: t('Server pagination'),
                  description: t(
                    'Enable server side pagination of results (experimental feature)',
                  ),
                  default: false,
                },
              },
            ]
          : [],
        [
          {
            name: 'row_limit',
            override: {
              default: 1000,
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                !controls?.server_pagination?.value,
            },
          },
          {
            name: 'server_page_length',
            config: {
              type: 'SelectControl',
              freeForm: true,
              label: t('Server Page Length'),
              default: 10,
              choices: PAGE_SIZE_OPTIONS,
              description: t('Rows per page, 0 means no pagination'),
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                Boolean(controls?.server_pagination?.value),
            },
          },
        ],
      ],
    },
    {
      label: t('Hello Controls!'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'header_text',
            config: {
              type: 'TextControl',
              default: 'Immersa Table!',
              renderTrigger: true,
              label: t('Header Text'),
              description: t('The text you want to see in the header'),
            },
          },
        ],
        [
          {
            name: 'bold_text',
            config: {
              type: 'CheckboxControl',
              label: t('Bold Text'),
              renderTrigger: true,
              default: true,
              description: t('A checkbox to make the '),
            },
          },
        ],
        [
          {
            name: 'header_font_size',
            config: {
              type: 'SelectControl',
              label: t('Font Size'),
              default: 'xl',
              choices: [
                // [value, label]
                ['xxs', 'xx-small'],
                ['xs', 'x-small'],
                ['s', 'small'],
                ['m', 'medium'],
                ['l', 'large'],
                ['xl', 'x-large'],
                ['xxl', 'xx-large'],
              ],
              renderTrigger: true,
              description: t('The size of your header font'),
            },
          },
        ],
        [
          {
            name: 'page_length',
            config: {
              type: 'SelectControl',
              freeForm: true,
              renderTrigger: true,
              label: t('Page length'),
              default: null,
              choices: PAGE_SIZE_OPTIONS,
              description: t('Rows per page, 0 means no pagination'),
              visibility: ({ controls }: ControlPanelsContainerProps) =>
                !controls?.server_pagination?.value,
            },
          },
          null,
        ],
        [
          {
            name: 'include_search',
            config: {
              type: 'CheckboxControl',
              label: t('Search box'),
              renderTrigger: true,
              default: false,
              description: t('Whether to include a client-side search box'),
            },
          },
        ],
        [
          {
            name: 'allow_rearrange_columns',
            config: {
              type: 'CheckboxControl',
              label: t('Allow columns to be rearranged'),
              renderTrigger: true,
              default: false,
              description: t(
                "Allow end user to drag-and-drop column headers to rearrange them. Note their changes won't persist for the next time they open the chart.",
              ),
            },
          },
        ],
        [
          {
            name: 'area_chart_cols',
            config: {
              ...sharedControls.groupby,
              label: t('Display Area Chart'),
              renderTrigger: true,
              description: t(
                'Select Columns for which you want to display the Area chart',
              ),
            },
          },
        ],
        [
          {
            name: 'time_range_cols',
            config: {
              ...sharedControls.groupby,
              label: t('Filter Columns'),
              renderTrigger: true,
              description: t('Select Columns for time range filter'),
            },
          },
        ],
        [
          {
            name: 'time_range',
            config: {
              type: 'DateFilterControl',
              label: t('Time Range'),
              default: 'custom',
              freeForm: true,
              renderTrigger: true,
              description: t('Select the desired time range'),
            },
          },
        ],
        [
          {
            name: 'column_config',
            config: {
              type: 'ColumnConfigControl',
              label: t('Customize columns'),
              description: t('Further customize how to display each column'),
              width: 400,
              height: 320,
              renderTrigger: true,
              shouldMapStateToProps() {
                return true;
              },
              mapStateToProps(explore, _, chart) {
                return {
                  queryResponse: chart?.queriesResponse?.[0],
                };
              },
            },
          },
        ],
      ],
    },
  ],
};

export default config;
