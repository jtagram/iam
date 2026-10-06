import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, iamResponse } from "@/test/mocks/iam";
import { GET, POST } from "./route";

const cookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: cookieGet }),
}));

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("IAM_API_URL", "http://iam.test");
  vi.stubGlobal("fetch", fetchMock);
  cookieGet.mockReturnValue({ value: "tok123" });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("GET /api/roles", () => {
  it("throws when IAM_API_URL is missing", async () => {
    vi.stubEnv("IAM_API_URL", "");

    await expect(GET(jsonRequest("http://localhost/api", "GET"))).rejects.toThrow(
      "IAM_API_URL environment variable is required",
    );
  });

  it("returns 401 when there is no auth cookie", async () => {
    cookieGet.mockReturnValue(undefined);

    const res = await GET(jsonRequest("http://localhost/api", "GET"));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: "No autenticado." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 when applicationId is missing", async () => {
    const res = await GET(jsonRequest("http://localhost/api/roles", "GET"));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      message: "applicationId es obligatorio.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the IAM error status and message", async () => {
    fetchMock.mockResolvedValue(iamResponse({ message: "Forbidden" }, 403));

    const res = await GET(jsonRequest("http://localhost/api/roles?applicationId=5", "GET"));

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ message: "Forbidden" });
  });

  it("joins array messages from IAM", async () => {
    fetchMock.mockResolvedValue(iamResponse({ message: ["one", "two"] }, 400));

    const res = await GET(jsonRequest("http://localhost/api/roles?applicationId=5", "GET"));

    expect(await res.json()).toEqual({ message: "one, two" });
  });

  it("uses a fallback message when IAM sends none", async () => {
    fetchMock.mockResolvedValue(iamResponse({}, 500));

    const res = await GET(jsonRequest("http://localhost/api/roles?applicationId=5", "GET"));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      message: "No se pudieron obtener los roles.",
    });
  });

  it("proxies the IAM response with the bearer token", async () => {
    fetchMock.mockResolvedValue(iamResponse({ data: [{ id: 1 }] }));

    const res = await GET(jsonRequest("http://localhost/api/roles?applicationId=5", "GET"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: [{ id: 1 }] });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://iam.test/roles?applicationId=5",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer tok123" },
      }),
    );
  });
});

describe("POST /api/roles", () => {
  it("throws when IAM_API_URL is missing", async () => {
    vi.stubEnv("IAM_API_URL", "");

    await expect(POST(jsonRequest("http://localhost/api", "POST", { applicationId: 3, name: "admin", description: "desc" }))).rejects.toThrow(
      "IAM_API_URL environment variable is required",
    );
  });

  it("returns 401 when there is no auth cookie", async () => {
    cookieGet.mockReturnValue(undefined);

    const res = await POST(jsonRequest("http://localhost/api", "POST", { applicationId: 3, name: "admin", description: "desc" }));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: "No autenticado." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the body is not valid JSON", async () => {
    const res = await POST(jsonRequest("http://localhost/api", "POST", "not-json"));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      message: "Cuerpo de la petición inválido.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the IAM error status and message", async () => {
    fetchMock.mockResolvedValue(iamResponse({ message: "Forbidden" }, 403));

    const res = await POST(jsonRequest("http://localhost/api", "POST", { applicationId: 3, name: "admin", description: "desc" }));

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ message: "Forbidden" });
  });

  it("joins array messages from IAM", async () => {
    fetchMock.mockResolvedValue(iamResponse({ message: ["one", "two"] }, 400));

    const res = await POST(jsonRequest("http://localhost/api", "POST", { applicationId: 3, name: "admin", description: "desc" }));

    expect(await res.json()).toEqual({ message: "one, two" });
  });

  it("uses a fallback message when IAM sends none", async () => {
    fetchMock.mockResolvedValue(iamResponse({}, 500));

    const res = await POST(jsonRequest("http://localhost/api", "POST", { applicationId: 3, name: "admin", description: "desc" }));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      message: "No se pudo crear el rol.",
    });
  });

  it("forwards only the expected fields to IAM and returns its response", async () => {
    fetchMock.mockResolvedValue(iamResponse({ data: { id: 9 } }, 201));

    const res = await POST(jsonRequest("http://localhost/api", "POST", { ...{ applicationId: 3, name: "admin", description: "desc" }, extra: "ignored" }));

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ data: { id: 9 } });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://iam.test/roles",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer tok123",
        },
        body: JSON.stringify({ applicationId: 3, name: "admin", description: "desc" }),
      },
    );
  });
});

describe("GET /api/roles robustness", () => {
  it("forwards IAM's status with the fallback message when an error body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 503 }));

    const res = await GET(jsonRequest("http://localhost/api/roles?applicationId=1", "GET"));

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ message: "No se pudieron obtener los roles." });
  });

  it("returns 502 with the fallback message when a successful IAM response is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("not json", { status: 200 }));

    const res = await GET(jsonRequest("http://localhost/api/roles?applicationId=1", "GET"));

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ message: "No se pudieron obtener los roles." });
  });
});

describe("POST /api/roles robustness", () => {
  it("forwards IAM's status with the fallback message when an error body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 503 }));

    const res = await POST(jsonRequest("http://localhost/api/roles", "POST", {"name": "r"}));

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ message: "No se pudo crear el rol." });
  });

  it("returns 502 with the fallback message when a successful IAM response is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("not json", { status: 200 }));

    const res = await POST(jsonRequest("http://localhost/api/roles", "POST", {"name": "r"}));

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ message: "No se pudo crear el rol." });
  });
});
