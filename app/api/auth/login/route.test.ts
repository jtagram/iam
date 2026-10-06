import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_COOKIE_NAME } from "@/app/lib/auth-cookie";
import { POST } from "./route";

const cookieSet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: async () => ({ set: cookieSet }),
}));

const fetchMock = vi.fn();

function loginRequest(body: unknown) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function iamResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.stubEnv("IAM_API_URL", "http://iam.test");
    vi.stubEnv("IAM_APPLICATION_NAME", "iam-app");
    vi.stubEnv("IAM_TARGET_APPLICATION_NAME", "target-app");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("returns 400 when the body is not valid JSON", async () => {
    const res = await POST(loginRequest("not-json"));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 when email or password is missing", async () => {
    const res = await POST(loginRequest({ email: "a@b.com" }));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the IAM error status and message", async () => {
    fetchMock.mockResolvedValue(iamResponse({ message: "Bad credentials" }, 401));

    const res = await POST(loginRequest({ email: "a@b.com", password: "x" }));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: "Bad credentials" });
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it("joins array messages from IAM", async () => {
    fetchMock.mockResolvedValue(iamResponse({ message: ["one", "two"] }, 400));

    const res = await POST(loginRequest({ email: "a@b.com", password: "x" }));

    expect(await res.json()).toEqual({ message: "one, two" });
  });

  it("uses the fallback message with IAM's status when an error body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>", { status: 503 }));

    const res = await POST(loginRequest({ email: "a@b.com", password: "x" }));

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ message: "No se pudo iniciar sesión." });
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it("returns 502 and sets no cookie when a successful IAM response has no token", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 200 }));

    const res = await POST(loginRequest({ email: "a@b.com", password: "x" }));

    expect(res.status).toBe(502);
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it("sets the auth cookie and returns ok on success", async () => {
    fetchMock.mockResolvedValue(iamResponse({ access_token: "tok123" }));

    const res = await POST(loginRequest({ email: "a@b.com", password: "x" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://iam.test/internal-users/login",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-application-name": "iam-app",
          "x-target-application": "target-app",
        }),
      }),
    );
    expect(cookieSet).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      "tok123",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      }),
    );
  });

  it("throws when a required env var is missing", async () => {
    vi.stubEnv("IAM_API_URL", "");

    await expect(
      POST(loginRequest({ email: "a@b.com", password: "x" })),
    ).rejects.toThrow("IAM_API_URL environment variable is required");
  });
});
