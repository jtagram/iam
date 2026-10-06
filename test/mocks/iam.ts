/** Builds a Response like the IAM API would return. */
export function iamResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

/** Builds a Request with a JSON (or raw string) body for route handlers. */
export function jsonRequest(
  url: string,
  method: string,
  body?: unknown,
): Request {
  return new Request(url, {
    method,
    body:
      body === undefined
        ? undefined
        : typeof body === "string"
          ? body
          : JSON.stringify(body),
  });
}

/** Dynamic route params are Promises in this Next version. */
export function routeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}
