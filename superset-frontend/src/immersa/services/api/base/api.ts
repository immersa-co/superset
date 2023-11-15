export type Methods = 'getAll' | 'get' | 'post' | 'put' | 'patch' | 'remove';

export type MethodsMap = {
  [key in Methods]: unknown;
};

export interface IApiCustomMethodOptions {
  url?: string;
}

export abstract class Api<T> implements MethodsMap {
  getAll: (() => Promise<T[]> | undefined) | undefined;

  get: ((id: string) => Promise<T>) | undefined;

  post:
    | ((
        model: unknown,
        customOptions?: IApiCustomMethodOptions,
      ) => Promise<unknown>)
    | undefined;

  put: ((model: unknown) => Promise<T>) | undefined;

  patch: ((id: string, model: unknown) => Promise<unknown>) | undefined;

  remove: ((model: unknown, id?: string) => Promise<unknown>) | undefined;
}
