import AliteErrors from "./AliteErrors";
import type { AliteOptions, RequestObjInterface } from "./types.ts";

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
  /**
   * add a request interceptor function
   * @param function - transform data
   * @return void
   * @example
   * alite.addRequestInterceptor((data) => {})
   */
  addRequestInterceptor(fn: Function) {
    this.reqMiddleware.push(fn);
  }
  /**
   * add a response interceptor function
   * @param function - transform data
   * @return void
   * @example
   * alite.addRequestInterceptor((data) => {})
   */
  addResponseInterceptor(fn: Function) {
    this.resMiddleware.push(fn);
  }
  /**
   * add a error interceptor function
   * @param function - tranform data
   * @return void
   * @example
   * alite.addRequestInterceptor((data) => {})
   */
  addErrorInterceptor(fn: Function) {
    this.errorMiddleware.push(fn);
  }
  /**
   * request timeout duration
   * @param ms - number of milliseconds before request timeouts
   * @return void
   * @example
   * alite.requestTimeout(3000) - timeout after 3 seconds
   */
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

  private returnUrl(url: string) {
    if (!this.baseUrl) {
      console.log("no base url");
      return url;
    }

    if (this.baseUrl && url) {
      console.log("base url and url");
      console.log(this.baseUrl + url);
      return this.baseUrl + url;
    }

    console.log("no url");
    return this.baseUrl;
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
        ...requestObj,
        url: this.returnUrl(requestObj.url),
        method: requestObj.method,
        headers: {
          ...requestObj.headers,
        },
      };
    } else {
      requestOptions = {
        ...requestObj,
        url: this.returnUrl(requestObj.url),
        method: requestObj.method,
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

  /**
   * sends a GET request
   * @param requestObj - an object to configure the request
   * @return parsed response data
   * @example
   * const posts = alite.get({url: 'example'})
   */
  async get(requestObj: RequestObjInterface) {
    const { request, timer } = await this.parseAndCreateRequest(
      this.method.get,
      requestObj,
    );
    console.log("======= options post request interceptor", request);
    const response = await this.fetcher(request, timer);
    return response;
  }
  /**
   * sends a POST request
   * @param requestObj - an object to configure the request
   * @return parsed response data
   * @example
   * const posts = alite.post({url: 'example'})
   */
  async post(requestObj: RequestObjInterface) {
    requestObj.method = this.method.post;
    const { request, timer } = await this.parseAndCreateRequest(
      this.method.post,
      requestObj,
    );

    const response = await this.fetcher(request, timer);
    return response;
  }
  /**
   * sends a PUT request
   * @param requestObj - an object to configure the request
   * @return parsed response data
   * @example
   * const posts = alite.put({url: 'example'})
   */
  async put(requestObj: RequestObjInterface) {
    requestObj.method = this.method.put;
    const { request, timer } = await this.parseAndCreateRequest(
      this.method.put,
      requestObj,
    );

    const response = await this.fetcher(request, timer);
    return response;
  }
  /**
   * sends a PATCH request
   * @param requestObj - an object to configure the request
   * @return parsed response data
   * @example
   * const posts = alite.patch({url: 'example'})
   */
  async patch(requestObj: RequestObjInterface) {
    requestObj.method = this.method.patch;
    const { request, timer } = await this.parseAndCreateRequest(
      this.method.patch,
      requestObj,
    );

    const response = await this.fetcher(request, timer);
    return response;
  }
  /**
   * sends a DELETE request
   * @param requestObj - an object to configure the request
   * @return parsed response data
   * @example
   * const posts = alite.delete({url: 'example'})
   */
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
