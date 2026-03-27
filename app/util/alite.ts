interface AliteOptions {
  baseUrl?: string;
  // reqMiddleware: any[];
  // resMiddleware: any[];
}

interface RequestObjInterface {
  url?: string;
  headers?: Record<string, string>;
  [key: string]: any;
}

interface OptionsInterface {
  headers?: Record<string, string>;
  [key: string]: any;
}

export default class Alite {
  // private url: string;
  private reqMiddleware: any[];
  private resMiddleware: any[];
  public baseUrl: string;
  private method: Record<string, string>;

  constructor(options: AliteOptions = {}) {
    // const url = options.url;
    this.reqMiddleware = [];
    this.resMiddleware = [];
    this.baseUrl = options.baseUrl || "";
    this.method = {
      get: "GET",
      post: "POST",
      put: "PUT",
      patch: "PATCH",
      delete: "DELETE",
    };
  }

  addRequestInterceptor(fn: Function) {
    // const req = new Request(url, options);
    // console.log(req);

    this.reqMiddleware.push(fn);
    // return req;
  }

  addResponseInterceptor(fn: Function) {
    this.resMiddleware.push(fn);
  }

  errorInterceptor(err) {
    return err;
  }

  addErrorInterceptor(error) {}

  requestTimeout(num: number) {
    setTimeout(() => {});
  }

  private async fetcher(request) {
    try {
      console.log("about to fetch data ======");
      console.log(request);
      const response = await fetch(request);

      if (!response.ok) {
        throw new Error("error from server");
      }

      const result = await response.json();
      console.log(result);
      const transformedResult = await this.runRequest(
        this.resMiddleware,
        result,
      );
      console.log(result);
      return transformedResult;
    } catch (err) {
      console.log(err);
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

    console.log("====== request options", requestOptions);
    const optionsResult = await this.runRequest(
      this.reqMiddleware,
      requestOptions,
    );
    console.log("======= options post request interceptor", optionsResult);
    const request = new Request(optionsResult.url, optionsResult);
    return request;
  }

  private async runRequest(reqStack: Function[], data) {
    console.log("request options", data);
    const composition = reqStack.reduce(async (prevFunc, currFunc) => {
      const resolved = await prevFunc;
      return currFunc(resolved);
    }, Promise.resolve(data));
    return composition;
  }

  async get(requestObj: RequestObjInterface) {
    console.log("options pre request interceptor ====", requestObj);
    const request = await this.parseAndCreateRequest(
      this.method.get,
      requestObj,
    );
    console.log("======= options post request interceptor", request);
    const response = await this.fetcher(request);
    return response;
  }
  async post(requestObj: RequestObjInterface) {
    console.log("options pre request interceptor ====", requestObj);
    requestObj.method = this.method.post;
    const request = await this.parseAndCreateRequest(
      this.method.post,
      requestObj,
    );

    const response = await this.fetcher(request);
    return response;
  }
  async put(requestObj: RequestObjInterface) {
    console.log("options pre request interceptor ====", requestObj);
    requestObj.method = this.method.put;
    const request = await this.parseAndCreateRequest(
      this.method.put,
      requestObj,
    );

    const response = await this.fetcher(request);
    return response;
  }
  async patch(requestObj: RequestObjInterface) {
    console.log("options pre request interceptor ====", requestObj);
    requestObj.method = this.method.patch;
    const request = await this.parseAndCreateRequest(
      this.method.patch,
      requestObj,
    );

    const response = await this.fetcher(request);
    return response;
  }
  async delete(requestObj: RequestObjInterface) {
    console.log("options pre request interceptor ====", requestObj);
    requestObj.method = this.method.delete;
    const request = await this.parseAndCreateRequest(
      this.method.delete,
      requestObj,
    );

    const response = await this.fetcher(request);
    return response;
  }
}
