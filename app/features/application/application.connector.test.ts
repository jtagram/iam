import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchApplications,
  postApplication,
} from "./application.connector";

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

describe("fetchApplications", () => {
  it("requests /api/applications with the abort signal and returns ok and data", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [] }));
    const controller = new AbortController();

    const result = await fetchApplications(controller.signal);

    expect(fetchMock).toHaveBeenCalledWith("/api/applications", {
      signal: controller.signal,
    });
    expect(result).toEqual({ ok: true, data: { data: [] } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 500));

    const result = await fetchApplications();

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 502 }));

    const result = await fetchApplications();

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(fetchApplications()).rejects.toThrow("network down");
  });
});

describe("postApplication", () => {
  it("POSTs the JSON payload to /api/applications", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }, 201));
    const payload = { name: "app", description: "desc" };

    const result = await postApplication(payload);

    expect(fetchMock).toHaveBeenCalledWith("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ ok: true, data: { ok: true } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 400));

    const result = await postApplication({ name: "app", description: "desc" });

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));

    const result = await postApplication({ name: "app", description: "desc" });

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(postApplication({ name: "app", description: "desc" })).rejects.toThrow("network down");
  });
});
