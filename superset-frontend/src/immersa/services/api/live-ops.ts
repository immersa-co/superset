/* eslint-disable import/prefer-default-export */
/* eslint-disable prefer-destructuring */
/* eslint-disable class-methods-use-this */
// import { createSearchParams } from 'react-router-dom';
import { LiveOpsSegment } from 'src/immersa/models';

import { apiProvider } from './base/provider';

class LiveOpsApi {
  baseUrl: string;

  constructor() {
    this.baseUrl = `${window.location.origin}/immersa`;
  }

  async getSegments({ signal }: { signal?: AbortSignal }) {
    return apiProvider.getAll<LiveOpsSegment[]>(this.baseUrl, `segments/me`, {
      signal,
    });
  }
}

export const liveOpsApi = new LiveOpsApi();
