import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchInternalUsers,
  fetchAssignedApplicationsForInternalUser,
  fetchConnectionsForInternalUser,
  postInternalUser,
  postConnectionForInternalUser,
  postAssignApplicationToInternalUser,
  postAssignRoleToInternalUser,
} from "./internal-user.connector";

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

describe("fetchInternalUsers", () => {
  it("requests /api/internal-users with the abort signal and returns ok and data", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [] }));
    const controller = new AbortController();

    const result = await fetchInternalUsers(controller.signal);

    expect(fetchMock).toHaveBeenCalledWith("/api/internal-users", {
      signal: controller.signal,
    });
    expect(result).toEqual({ ok: true, data: { data: [] } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 500));

    const result = await fetchInternalUsers();

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 502 }));

    const result = await fetchInternalUsers();

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(fetchInternalUsers()).rejects.toThrow("network down");
  });
});

describe("fetchAssignedApplicationsForInternalUser", () => {
  it("requests /api/internal-users/7/applications with the abort signal and returns ok and data", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [] }));
    const controller = new AbortController();

    const result = await fetchAssignedApplicationsForInternalUser(7, controller.signal);

    expect(fetchMock).toHaveBeenCalledWith("/api/internal-users/7/applications", {
      signal: controller.signal,
    });
    expect(result).toEqual({ ok: true, data: { data: [] } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 500));

    const result = await fetchAssignedApplicationsForInternalUser(7);

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 502 }));

    const result = await fetchAssignedApplicationsForInternalUser(7);

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(fetchAssignedApplicationsForInternalUser(7)).rejects.toThrow("network down");
  });
});

describe("fetchConnectionsForInternalUser", () => {
  it("requests /api/internal-users/7/connections with the abort signal and returns ok and data", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [] }));
    const controller = new AbortController();

    const result = await fetchConnectionsForInternalUser(7, controller.signal);

    expect(fetchMock).toHaveBeenCalledWith("/api/internal-users/7/connections", {
      signal: controller.signal,
    });
    expect(result).toEqual({ ok: true, data: { data: [] } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 500));

    const result = await fetchConnectionsForInternalUser(7);

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 502 }));

    const result = await fetchConnectionsForInternalUser(7);

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(fetchConnectionsForInternalUser(7)).rejects.toThrow("network down");
  });
});

describe("postInternalUser", () => {
  it("POSTs the JSON payload to /api/internal-users", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }, 201));
    const payload = { name: "Ana", lastname: "Gil", email: "a@b.com", password: "secret" };

    const result = await postInternalUser(payload);

    expect(fetchMock).toHaveBeenCalledWith("/api/internal-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ ok: true, data: { ok: true } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 400));

    const result = await postInternalUser({ name: "Ana", lastname: "Gil", email: "a@b.com", password: "secret" });

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));

    const result = await postInternalUser({ name: "Ana", lastname: "Gil", email: "a@b.com", password: "secret" });

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(postInternalUser({ name: "Ana", lastname: "Gil", email: "a@b.com", password: "secret" })).rejects.toThrow("network down");
  });
});

describe("postConnectionForInternalUser", () => {
  it("POSTs the JSON payload to /api/internal-users/7/connections", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }, 201));
    const payload = { originApplicationId: 1, destinationApplicationId: 2 };

    const result = await postConnectionForInternalUser(7, payload);

    expect(fetchMock).toHaveBeenCalledWith("/api/internal-users/7/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ ok: true, data: { ok: true } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 400));

    const result = await postConnectionForInternalUser(7, { originApplicationId: 1, destinationApplicationId: 2 });

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));

    const result = await postConnectionForInternalUser(7, { originApplicationId: 1, destinationApplicationId: 2 });

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(postConnectionForInternalUser(7, { originApplicationId: 1, destinationApplicationId: 2 })).rejects.toThrow("network down");
  });
});

describe("postAssignApplicationToInternalUser", () => {
  it("POSTs the JSON payload to /api/internal-users/7/applications", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }, 201));
    const payload = { applicationId: 2 };

    const result = await postAssignApplicationToInternalUser(7, payload);

    expect(fetchMock).toHaveBeenCalledWith("/api/internal-users/7/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ ok: true, data: { ok: true } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 400));

    const result = await postAssignApplicationToInternalUser(7, { applicationId: 2 });

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));

    const result = await postAssignApplicationToInternalUser(7, { applicationId: 2 });

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(postAssignApplicationToInternalUser(7, { applicationId: 2 })).rejects.toThrow("network down");
  });
});

describe("postAssignRoleToInternalUser", () => {
  it("POSTs the JSON payload to /api/internal-users/7/roles", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }, 201));
    const payload = { roleId: 3 };

    const result = await postAssignRoleToInternalUser(7, payload);

    expect(fetchMock).toHaveBeenCalledWith("/api/internal-users/7/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ ok: true, data: { ok: true } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 400));

    const result = await postAssignRoleToInternalUser(7, { roleId: 3 });

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));

    const result = await postAssignRoleToInternalUser(7, { roleId: 3 });

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(postAssignRoleToInternalUser(7, { roleId: 3 })).rejects.toThrow("network down");
  });
});
