export interface AliteOptions {
  baseUrl?: string;
  timeout?: number;
  retry?: number;
}
/**
 * configuration object for alite RequestObjInterface
 */
export interface RequestObjInterface {
  /** the endpoint to request */
  url?: string;
  /** headers of request key: value */
  headers?: Record<string, string>;
  /** request object options */
  [key: string]: any;
  /** abort signal */
  signal?: AbortSignal | null;
}
