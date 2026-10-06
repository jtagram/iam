import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, iamResponse, routeParams } from "@/test/mocks/iam";
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

describe("GET /api/internal-users/[id]/applications", () => {
  it("throws when IAM_API_URL is missing", async () => {
    vi.stubEnv("IAM_API_URL", "");

    await expect(GET(jsonRequest("http://localhost/api", "GET"), routeParams("7"))).rejects.toThrow(
      "IAM_API_URL environment variable is required",
    );
  });

  it("returns 401 when there is no auth cookie", async () => {
    cookieGet.mockReturnValue(undefined);

    const res = await GET(jsonRequest("http://localhost/api", "GET"), routeParams("7"));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: "No autenticado." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the IAM error status and message", async () => {
    fetchMock.mockResolvedValue(iamResponse({ message: "Forbidden" }, 403));

    const res = await GET(jsonRequest("http://localhost/api", "GET"), routeParams("7"));

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ message: "Forbidden" });
  });

  it("joins array messages from IAM", async () => {
    fetchMock.mockResolvedValue(iamResponse({ message: ["one", "two"] }, 400));

    const res = await GET(jsonRequest("http://localhost/api", "GET"), routeParams("7"));

    expect(await res.json()).toEqual({ message: "one, two" });
  });

  it("uses a fallback message when IAM sends none", async () => {
    fetchMock.mockResolvedValue(iamResponse({}, 500));

    const res = await GET(jsonRequest("http://localhost/api", "GET"), routeParams("7"));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      message: "No se pudieron obtener las aplicaciones asignadas.",
    });
  });

  it("proxies the IAM response with the bearer token", async () => {
    fetchMock.mockResolvedValue(iamResponse({ data: [{ id: 1 }] }));

    const res = await GET(jsonRequest("http://localhost/api", "GET"), routeParams("7"));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: [{ id: 1 }] });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://iam.test/internal-users/7/applications",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer tok123" },
      }),
    );
  });
});

describe("POST /api/internal-users/[id]/applications", () => {
  it("throws when IAM_API_URL is missing", async () => {
    vi.stubEnv("IAM_API_URL", "");

    await expect(POST(jsonRequest("http://localhost/api", "POST", { applicationId: 4 }), routeParams("7"))).rejects.toThrow(
      "IAM_API_URL environment variable is required",
    );
  });

  it("returns 401 when there is no auth cookie", async () => {
    cookieGet.mockReturnValue(undefined);

    const res = await POST(jsonRequest("http://localhost/api", "POST", { applicationId: 4 }), routeParams("7"));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: "No autenticado." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 when the body is not valid JSON", async () => {
    const res = await POST(jsonRequest("http://localhost/api", "POST", "not-json"), routeParams("7"));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      message: "Cuerpo de la petición inválido.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the IAM error status and message", async () => {
    fetchMock.mockResolvedValue(iamResponse({ message: "Forbidden" }, 403));

    const res = await POST(jsonRequest("http://localhost/api", "POST", { applicationId: 4 }), routeParams("7"));

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ message: "Forbidden" });
  });

  it("joins array messages from IAM", async () => {
    fetchMock.mockResolvedValue(iamResponse({ message: ["one", "two"] }, 400));

    const res = await POST(jsonRequest("http://localhost/api", "POST", { applicationId: 4 }), routeParams("7"));

    expect(await res.json()).toEqual({ message: "one, two" });
  });

  it("uses a fallback message when IAM sends none", async () => {
    fetchMock.mockResolvedValue(iamResponse({}, 500));

    const res = await POST(jsonRequest("http://localhost/api", "POST", { applicationId: 4 }), routeParams("7"));

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      message: "No se pudo asignar la aplicación al usuario interno.",
    });
  });

  it("forwards only the expected fields to IAM and returns its response", async () => {
    fetchMock.mockResolvedValue(iamResponse({ data: { id: 9 } }, 201));

    const res = await POST(jsonRequest("http://localhost/api", "POST", { ...{ applicationId: 4 }, extra: "ignored" }), routeParams("7"));

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ data: { id: 9 } });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://iam.test/internal-users/7/applications",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer tok123",
        },
        body: JSON.stringify({ applicationId: 4 }),
      },
    );
  });
});

describe("GET /api/internal-users/[id]/applications robustness", () => {
  it.each(["abc", "1/../2", "7?x=1", "-1", "1.5", ""])(
    "returns 400 without calling IAM when the id is %j",
    async (badId) => {
      const res = await GET(jsonRequest("http://localhost/api/x", "GET"), routeParams(badId));

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        message: "El identificador de usuario interno es inválido.",
      });
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("forwards IAM's status with the fallback message when an error body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 503 }));

    const res = await GET(jsonRequest("http://localhost/api/x", "GET"), routeParams("7"));

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ message: "No se pudieron obtener las aplicaciones asignadas." });
  });

  it("returns 502 with the fallback message when a successful IAM response is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("not json", { status: 200 }));

    const res = await GET(jsonRequest("http://localhost/api/x", "GET"), routeParams("7"));

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ message: "No se pudieron obtener las aplicaciones asignadas." });
  });
});

describe("POST /api/internal-users/[id]/applications robustness", () => {
  it.each(["abc", "1/../2", "7?x=1", "-1", "1.5", ""])(
    "returns 400 without calling IAM when the id is %j",
    async (badId) => {
      const res = await POST(jsonRequest("http://localhost/api/x", "POST", {"applicationId": 1}), routeParams(badId));

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        message: "El identificador de usuario interno es inválido.",
      });
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("forwards IAM's status with the fallback message when an error body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 503 }));

    const res = await POST(jsonRequest("http://localhost/api/x", "POST", {"applicationId": 1}), routeParams("7"));

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ message: "No se pudo asignar la aplicación al usuario interno." });
  });

  it("returns 502 with the fallback message when a successful IAM response is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("not json", { status: 200 }));

    const res = await POST(jsonRequest("http://localhost/api/x", "POST", {"applicationId": 1}), routeParams("7"));

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ message: "No se pudo asignar la aplicación al usuario interno." });
  });
});
