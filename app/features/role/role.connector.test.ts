import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchRolesByApplication,
  postRole,
} from "./role.connector";

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("fetchRolesByApplication", () => {
  it("requests /api/roles?applicationId=5 with the abort signal and returns ok and data", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [] }));
    const controller = new AbortController();

    const result = await fetchRolesByApplication(5, controller.signal);

    expect(fetchMock).toHaveBeenCalledWith("/api/roles?applicationId=5", {
      signal: controller.signal,
    });
    expect(result).toEqual({ ok: true, data: { data: [] } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 500));

    const result = await fetchRolesByApplication(5);

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 502 }));

    const result = await fetchRolesByApplication(5);

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(fetchRolesByApplication(5)).rejects.toThrow("network down");
  });
});

describe("postRole", () => {
  it("POSTs the JSON payload to /api/roles", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }, 201));
    const payload = { applicationId: 5, name: "admin", description: "desc" };

    const result = await postRole(payload);

    expect(fetchMock).toHaveBeenCalledWith("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ ok: true, data: { ok: true } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 400));

    const result = await postRole({ applicationId: 5, name: "admin", description: "desc" });

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));

    const result = await postRole({ applicationId: 5, name: "admin", description: "desc" });

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(postRole({ applicationId: 5, name: "admin", description: "desc" })).rejects.toThrow("network down");
  });
});
