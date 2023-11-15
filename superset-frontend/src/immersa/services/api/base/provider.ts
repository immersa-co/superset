/* eslint-disable import/prefer-default-export */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleResponse } from './handlers';

const buildPath = (segments: string[]) => segments.filter(Boolean).join('/');

const _getHeaders = ({
  token,
  impersonateUser,
}: {
  token?: string;
  impersonateUser?: string;
}) => {
  if (token && impersonateUser) {
    return {
      Authorization: `Bearer ${token}`,
      'Impersonate-User': impersonateUser,
    };
  }
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
};

const _getAll = async <T>(
  baseUrl: string,
  resource: string,
  config: AxiosRequestConfig = {},
): Promise<T> => {
  const response = await axios.get<T, AxiosResponse<T, unknown>>(
    new URL(resource, baseUrl).toString(),
    config,
  );
  return handleResponse<T>(response);
};

const _get = async <T>(
  baseUrl: string,
  resource: string,
  resourceId: string,
  config: AxiosRequestConfig = {},
): Promise<T> => {
  const response = await axios.get<T, AxiosResponse<T, unknown>>(
    new URL(buildPath([resource, resourceId]), baseUrl).toString(),
    config,
  );
  return handleResponse<T>(response);
};

const _post = async <T, D>(
  baseUrl: string,
  resource: string,
  data?: D,
  config: AxiosRequestConfig = {},
) => {
  const response = await axios.post<T, AxiosResponse<T, unknown>>(
    new URL(resource, baseUrl).toString(),
    data,
    config,
  );
  return handleResponse<T>(response);
};

const _put = async <T, D>(
  baseUrl: string,
  resource: string,
  resourceId: string,
  data: D,
  config: AxiosRequestConfig = {},
): Promise<T> => {
  const response = await axios.put<T, AxiosResponse<T, unknown>>(
    new URL(buildPath([resource, resourceId]), baseUrl).toString(),
    data,
    config,
  );
  return handleResponse<T>(response);
};

const _patch = async <T, D>(
  baseUrl: string,
  resource: string,
  resourceId: string,
  data: D,
  config: AxiosRequestConfig = {},
) => {
  const response = await axios.patch<T, AxiosResponse<T, unknown>>(
    new URL(buildPath([resource, resourceId]), baseUrl).toString(),
    data,
    config,
  );
  return handleResponse<T>(response);
};

// TODO: remove in the future in order to only support delete
const _remove = async <T, D>(
  baseUrl: string,
  resource: string,
  resourceId: string,
  data: D,
) => {
  const response = await axios.delete(
    new URL(buildPath([resource, resourceId]), baseUrl).toString(),
    { data },
  );
  return handleResponse<T>(response);
};

const _delete = async <T>(
  baseUrl: string,
  resource: string,
  resourceId: string,
  config: AxiosRequestConfig = {},
) => {
  const response = await axios.delete(
    new URL(buildPath([resource, resourceId]), baseUrl).toString(),
    config,
  );
  return handleResponse<T>(response);
};

const _getAllUri = (
  baseUrl: string,
  resource: string,
  config: AxiosRequestConfig = {},
) =>
  axios
    .create()
    .getUri({ url: new URL(resource, baseUrl).toString(), ...config });

export const apiProvider = {
  getAll: _getAll,
  get: _get,
  post: _post,
  put: _put,
  patch: _patch,
  remove: _remove,
  delete: _delete,
  getHeaders: _getHeaders,
  getAllUri: _getAllUri,
};
