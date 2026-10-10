import { afterEach, describe, expect, it, vi } from "vitest";
import { AUTH_COOKIE_NAME } from "@/app/lib/auth-cookie";
import {
  extractErrorMessage,
  forwardIamResponse,
  getAuthToken,
  invalidIdResponse,
  isValidId,
  readIamBody,
} from "../iam-proxy";

const cookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: cookieGet }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("extractErrorMessage", () => {
  it("returns the string message", () => {
    expect(extractErrorMessage({ message: "boom" }, "fb")).toBe("boom");
  });

  it("joins array messages", () => {
    expect(extractErrorMessage({ message: ["a", "b"] }, "fb")).toBe("a, b");
  });

  it("falls back when there is no message or no body", () => {
    expect(extractErrorMessage({}, "fb")).toBe("fb");
    expect(extractErrorMessage(null, "fb")).toBe("fb");
    expect(extractErrorMessage(undefined, "fb")).toBe("fb");
  });
});

describe("getAuthToken", () => {
  it("returns the cookie token", async () => {
    cookieGet.mockReturnValue({ value: "tok" });

    expect(await getAuthToken()).toEqual({ token: "tok" });
    expect(cookieGet).toHaveBeenCalledWith(AUTH_COOKIE_NAME);
  });

  it("returns a 401 response when the cookie is missing", async () => {
    cookieGet.mockReturnValue(undefined);

    const result = await getAuthToken();

    expect(result.token).toBeUndefined();
    expect(result.unauthorized?.status).toBe(401);
    expect(await result.unauthorized?.json()).toEqual({
      message: "No autenticado.",
    });
  });
});

describe("isValidId / invalidIdResponse", () => {
  it.each(["0", "7", "12345"])("accepts %j", (id) => {
    expect(isValidId(id)).toBe(true);
  });

  it.each(["", "abc", "-1", "1.5", "1/2", "7?x=1", " 7", "7\n", "../../1"])(
    "rejects %j",
    (id) => {
      expect(isValidId(id)).toBe(false);
    },
  );

  it("builds a 400 response", async () => {
    const res = invalidIdResponse();

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      message: "El identificador de usuario es inválido.",
    });
  });
});

describe("readIamBody", () => {
  it("parses JSON", async () => {
    expect(await readIamBody(new Response('{"a":1}'))).toEqual({ a: 1 });
  });

  it("returns null for a non-JSON body", async () => {
    expect(await readIamBody(new Response("<html>"))).toBeNull();
    expect(await readIamBody(new Response(""))).toBeNull();
  });
});

describe("forwardIamResponse", () => {
  it("passes through a successful JSON body and status", async () => {
    const res = await forwardIamResponse(
      new Response('{"data":[1]}', { status: 201 }),
      "fb",
    );

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ data: [1] });
  });

  it("maps IAM errors to the message with IAM's status", async () => {
    const res = await forwardIamResponse(
      new Response('{"message":["x","y"]}', { status: 400 }),
      "fb",
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "x, y" });
  });

  it("uses the fallback when an error body is not JSON", async () => {
    const res = await forwardIamResponse(
      new Response("<html>", { status: 503 }),
      "fb",
    );

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ message: "fb" });
  });

  it("returns 502 with the fallback when an OK body is not JSON", async () => {
    const res = await forwardIamResponse(
      new Response("oops", { status: 200 }),
      "fb",
    );

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ message: "fb" });
  });
});
