import React, { useEffect, useState } from 'react';

import { UIButton } from 'src/immersa/components/ui';
import { formatISODistanceToNow } from 'src/immersa/utils';
import { liveOpsApi } from 'src/immersa/services/api';
import { LiveOpsSegment } from 'src/immersa/models';

import '../../immersa/styles.css';

const Immersa = () => {
  const [segments, setSegments] = useState<LiveOpsSegment[]>([]);

  const getSegments = async () => {
    const rawSegments = await liveOpsApi.getSegments({});

    setSegments(rawSegments);
  };

  useEffect(() => {
    getSegments();
  }, []);

  return (
    <>
      <div className="mb-4">
        <div className="flex flex-wrap bg-white">
          <div className="p-3 font-semibold mr-3 text-left inline-block leading-9 text-gray-900 text-xl">
            Segments
          </div>
          <div className="ml-auto p-3">
            <UIButton text="Create Segment" variant="text" color="primary" />
          </div>
        </div>
      </div>
      <div className="mx-4">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full p-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow border border-black border-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      CRM Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Last update
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {segments.map(segment => (
                    <tr key={segment.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {segment.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {segment.type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {segment.crmType}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatISODistanceToNow(segment.updatedAt)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="text-primary hover:text-orange-900 cursor-pointer">
                          Edit<span className="sr-only">, {segment.name}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Immersa;
