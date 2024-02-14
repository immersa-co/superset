/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useEffect, createRef, useMemo } from 'react';
import { styled } from '@superset-ui/core';
import { ChartData, DataType, SupersetPluginChartImmersatableProps, SupersetPluginChartImmersatableStylesProps } from './types';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { TimeSeriesCell } from './TimeSeries';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts


const Styles = styled.div<SupersetPluginChartImmersatableStylesProps>`
  padding: ${({ theme }) => theme.gridUnit * 2}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  overflow: auto;
  h3 {
    /* You can use your props to control CSS! */
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: ${({ theme, headerFontSize }) =>
      theme.typography.sizes[headerFontSize]}px;
    font-weight: ${({ theme, boldText }) =>
      theme.typography.weights[boldText ? 'bold' : 'normal']};
  }

  pre {
    height: ${({ theme, headerFontSize, height }) =>
      height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]}px;
  }
`;

const CustomStyle = {
  container: {
    border: "1px solid #d1d5db",
    borderRadius: "1rem",
    margin: "10px",
    width: "fit-content",
  },
  headerText: {
    padding: "17px 24px",
    border: "1px solid #d1d5db",
    borderTopLeftRadius: "1rem",
    borderTopRightRadius: "1rem",
    background: "#f3f4f6",
    fontSize: "1.4rem",
    fontWeight: "bold !important",
    color: "rgb(107 114 128)"
  }
};




/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function SupersetPluginChartImmersatable(props: SupersetPluginChartImmersatableProps) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  const { data, height, width } = props;

  const rootElem = createRef<HTMLDivElement>();

  // Often, you just want to access the DOM and do whatever you want.
  // Here, you can do that with createRef, and the useEffect hook.
  useEffect(() => {
    const root = rootElem.current as HTMLElement;
    console.log('Plugin element', root);
  });

  console.log('Plugin props', props);

  const DEFAULT_COLUMN_MIN_WIDTH = 160;

  const columnNames = Object.keys(data[0])
  
  console.log("columnNames",columnNames)

  const columnsMetadata = useMemo(()=>{
    return   columnNames.map((metadata)=>{
      return { width: DEFAULT_COLUMN_MIN_WIDTH,
        name:metadata,
        label:metadata,
        minWidth: null,
        maxWidth: null,
        sortable: true,
        sortDescFirst: true,
      }
    })
  },columnNames)

  const columns = useMemo<ColumnDef<DataType>[]>(() => {
    return columnsMetadata.map((columnMetadata) => {
        return {
          id: columnMetadata.name,
          header: columnMetadata.label,
          accessorKey: columnMetadata.name,
          minSize: columnMetadata.minWidth || DEFAULT_COLUMN_MIN_WIDTH,
          maxSize: columnMetadata.maxWidth || undefined,
          size: columnMetadata.width,
          enableSorting: columnMetadata.sortable,
          sortDescFirst: true,
          cell: (info: any) => {
            const value = info.getValue();
            console.log("Value?: ", typeof(value));
            if (value && value.toString().includes("[") && Array.isArray(JSON.parse(value as string))) {
                const chartData = JSON.parse(value).map((row: any) => {
                return {
                  xAxis: row[0], 
                  yAxis: row[1]
                }
              })
              return <TimeSeriesCell value="" chartData={chartData as ChartData} />;
            }
            else {
              return value;
            }
          }
        };
      }) as ColumnDef<DataType>[]
  }, [columnsMetadata]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <div style={CustomStyle.container}>
      <div style={CustomStyle.headerText}>{props.headerText}</div>

      {table.getHeaderGroups().map((headerGroup) => (
        <div
          key={headerGroup.id}
          style={{
            display: "flex",
            background: "#f9fafb",
          }}
        >
          {headerGroup.headers.map((header) => (
            <div
              key={header.id}
              className="headerStyled"
              style={{
                width: "200px",
                display: "flex",
                position: "relative",
                border: "1px solid #d1d5db",
                textTransform: "capitalize",
              }}
            >
              <div draggable="true">
                <div
                  style={{
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                    padding: "0.875rem 1rem",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      overflowWrap: "break-word",
                      width: "180px",
                      fontWeight: "bold",
                      
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
      {table.getRowModel().rows.map((row) => (
        <div
          key={row.id}
          className="rowStyled"
          style={{
            display: "flex",
          }}
        >
          {row.getVisibleCells().map((cell) => (
            <div
              key={cell.id}
              style={{
                width: "200px",
                display: "flex",
                position: "relative",
                border: "1px solid #d1d5db",
              }}
            >
              <div
                style={{
                  fontSize: "0.875rem",
                  lineHeight: "1.25rem",
                  maxHeight: "3rem",
                  padding: "0.875rem 1rem",
                  textAlign: "left",
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </div>
          ))}
        </div>
      ))}
     
    </div>
    </Styles>
  );
}


