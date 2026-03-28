import AliteErrors from "./AliteErrors";

interface AliteOptions {
  baseUrl?: string;
  timeout?: number;
  retry?: number;
}

interface RequestObjInterface {
  url?: string;
  headers?: Record<string, string>;
  [key: string]: any;
  signal?: AbortSignal | null;
}

export default class Alite {
  // private url: string;
  private reqMiddleware: any[];
  private resMiddleware: any[];
  private errorMiddleware: any[];
  public baseUrl: string;
  private method: Record<string, string>;
  public timeout: number;
  public retry: number;

  constructor(options: AliteOptions = {}) {
    // const url = options.url;
    this.reqMiddleware = [];
    this.resMiddleware = [];
    this.errorMiddleware = [];
    this.baseUrl = options.baseUrl || "";
    this.method = {
      get: "GET",
      post: "POST",
      put: "PUT",
      patch: "PATCH",
      delete: "DELETE",
    };
    this.timeout = options.timeout || 0;
    this.retry = options.retry || 0;
  }

  addRequestInterceptor(fn: Function) {
    this.reqMiddleware.push(fn);
  }

  addResponseInterceptor(fn: Function) {
    this.resMiddleware.push(fn);
  }

  addErrorInpterceptor(fn: Function) {
    this.errorMiddleware.push(fn);
  }

  requestTimeout(ms: number) {}

  private async fetcher(request, timer, attempt? = 0) {
    try {
      let response = await fetch(request.clone());

      if (timer) clearTimeout(timer);

      if (!response.ok && attempt < this.retry) {
        return await this.fetcher(request, timer, attempt + 1);
      }

      if (!response.ok) {
        throw new AliteErrors(response.status, response.statusText);
      }

      const result = await response.json();
      const transformedResult = await this.runRequest(
        this.resMiddleware,
        result,
      );
      return transformedResult;
    } catch (err) {
      if (err.name === "AbortError") {
        const timeoutError = new AliteErrors(408, "request Timeout");
        await this.runRequest(this.errorMiddleware, timeoutError);
        throw timeoutError;
      }
      if (err instanceof TypeError) {
        const networkError = new AliteErrors(0, "network error");
        await this.runRequest(this.errorMiddleware, networkError);
        throw networkError;
      }
      await this.runRequest(this.errorMiddleware, err);
      throw err;
    }
  }

  private async parseAndCreateRequest(
    method: string,
    requestObj: RequestObjInterface,
  ) {
    let requestOptions;
    // handles empty get where user already input baseUrl
    if (!requestObj) {
      requestObj = {};
    }

    //get cannot have a body
    if (method === "GET") {
      requestOptions = {
        url: requestObj.url || this.baseUrl,
        method: requestObj.method,
        ...requestObj,
        headers: {
          ...requestObj.headers,
        },
      };
    } else {
      requestOptions = {
        url: requestObj.url || this.baseUrl,
        method: requestObj.method,
        ...requestObj,
        body: JSON.stringify(requestObj.body),
        headers: {
          ...requestObj.headers,
        },
      };
    }
    const controller = new AbortController();
    const timer =
      this.timeout > 0
        ? setTimeout(() => controller.abort(), this.timeout)
        : null;

    requestOptions.signal = controller.signal;

    const optionsResult = await this.runRequest(
      this.reqMiddleware,
      requestOptions,
    );
    const request = new Request(optionsResult.url, optionsResult);
    return { request, timer };
  }

  private async runRequest(reqStack: Function[], data) {
    const composition = reqStack.reduce(async (prevFunc, currFunc) => {
      const resolved = await prevFunc;
      return currFunc(resolved);
    }, Promise.resolve(data));
    return composition;
  }

  async get(requestObj: RequestObjInterface) {
    const { request, timer } = await this.parseAndCreateRequest(
      this.method.get,
      requestObj,
    );
    console.log("======= options post request interceptor", request);
    const response = await this.fetcher(request, timer);
    return response;
  }
  async post(requestObj: RequestObjInterface) {
    requestObj.method = this.method.post;
    const { request, timer } = await this.parseAndCreateRequest(
      this.method.post,
      requestObj,
    );

    const response = await this.fetcher(request, timer);
    return response;
  }
  async put(requestObj: RequestObjInterface) {
    requestObj.method = this.method.put;
    const { reuqest, timer } = await this.parseAndCreateRequest(
      this.method.put,
      requestObj,
    );

    const response = await this.fetcher(request, timer);
    return response;
  }
  async patch(requestObj: RequestObjInterface) {
    requestObj.method = this.method.patch;
    const { request, timer } = await this.parseAndCreateRequest(
      this.method.patch,
      requestObj,
    );

    const response = await this.fetcher(request);
    return response;
  }
  async delete(requestObj: RequestObjInterface) {
    requestObj.method = this.method.delete;
    const { request, timer } = await this.parseAndCreateRequest(
      this.method.delete,
      requestObj,
    );

    const response = await this.fetcher(request, timer);
    return response;
  }
}
