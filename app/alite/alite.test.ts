import {
  describe,
  it,
  expect,
  afterAll,
  afterEach,
  beforeAll,
  test,
} from "vitest";
import Alite from "./alite";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const alite = new Alite({ baseUrl: "https://placeholder/posts" });

const posts = [
  {
    userId: 1,
    id: 1,
    title: "first post title",
    body: "first post body",
  },
  {
    userId: 2,
    id: 2,
    title: "second post title",
    body: "second body of the second post",
  },
];

let capturedRequest;

export const restHandlers = [
  http.get("https://placeholder/posts", async ({ request }) => {
    return HttpResponse.json(posts);
  }),
  http.get("https://placeholder/posts/:id", async ({ request }) => {
    return HttpResponse.json(posts);
  }),
  http.post("https://placeholder/posts", async ({ request }) => {
    const info = await request.json();
    return HttpResponse.json(info);
  }),
  http.put("https://placeholder/posts", async ({ request }) => {
    const info = await request.json();
    return HttpResponse.json(info);
  }),
  http.patch("https://placeholder/posts", async ({ request }) => {
    const body = await request.json();
    capturedRequest = { body, ...capturedRequest };
    return HttpResponse.json(posts);
  }),
  http.delete("https://placeholder/posts", () => {
    return HttpResponse.json(posts);
  }),
];

const server = setupServer(...restHandlers);
server.events.on("request:start", async ({ request }) => {
  // const reqBody = await new Response(request.body).json();
  capturedRequest = {
    // body: reqBody,
    headers: Object.fromEntries(request.headers),
    method: request.method,
    url: request.url,
  };
});

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterAll(() => server.close());

afterEach(() => server.resetHandlers());

test("instance baseUrl", async () => {
  expect(alite.baseUrl).toBe("https://placeholder/posts");

  await alite.get({ url: "/123" });
  expect(capturedRequest.url).toBe("https://placeholder/posts/123");
});

test("get method", async () => {
  const result = await alite.get();
  expect(result).toEqual(posts);
});

test("post method", async () => {
  const result = await alite.post({
    body: {
      userId: 3,
      id: 1,
      title: "title post",
      body: "body of the third post",
    },
  });
  const testObj = {
    userId: 3,
    id: 1,
    title: "title post",
    body: "body of the third post",
  };
  expect(result).toEqual(testObj);
});

test("put", async () => {
  const result = await alite.put({
    body: {
      userId: 10,
      id: 1,
      title: "eddited first title of posts",
      body: "eddited body ",
    },
  });
  const testObj = {
    userId: 10,
    id: 1,
    title: "eddited first title of posts",
    body: "eddited body ",
  };

  expect(result).toEqual(testObj);
});

test("patch route", async () => {
  const result = await alite.patch({
    body: {
      title: "eddited to title of the first post",
    },
  });

  console.log(result, "reault body =======");
  console.log(capturedRequest, "=========== patching");
});
