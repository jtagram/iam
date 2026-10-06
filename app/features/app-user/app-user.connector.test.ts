import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchAppUsers,
  fetchAssignedApplications,
  fetchConnectionsForAppUser,
  postAppUser,
  postConnectionForAppUser,
  postAssignApplicationToAppUser,
  postAssignRoleToAppUser,
} from "./app-user.connector";

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

describe("fetchAppUsers", () => {
  it("requests /api/apps-users with the abort signal and returns ok and data", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [] }));
    const controller = new AbortController();

    const result = await fetchAppUsers(controller.signal);

    expect(fetchMock).toHaveBeenCalledWith("/api/apps-users", {
      signal: controller.signal,
    });
    expect(result).toEqual({ ok: true, data: { data: [] } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 500));

    const result = await fetchAppUsers();

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 502 }));

    const result = await fetchAppUsers();

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(fetchAppUsers()).rejects.toThrow("network down");
  });
});

describe("fetchAssignedApplications", () => {
  it("requests /api/apps-users/7/applications with the abort signal and returns ok and data", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [] }));
    const controller = new AbortController();

    const result = await fetchAssignedApplications(7, controller.signal);

    expect(fetchMock).toHaveBeenCalledWith("/api/apps-users/7/applications", {
      signal: controller.signal,
    });
    expect(result).toEqual({ ok: true, data: { data: [] } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 500));

    const result = await fetchAssignedApplications(7);

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 502 }));

    const result = await fetchAssignedApplications(7);

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(fetchAssignedApplications(7)).rejects.toThrow("network down");
  });
});

describe("fetchConnectionsForAppUser", () => {
  it("requests /api/apps-users/7/connections with the abort signal and returns ok and data", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [] }));
    const controller = new AbortController();

    const result = await fetchConnectionsForAppUser(7, controller.signal);

    expect(fetchMock).toHaveBeenCalledWith("/api/apps-users/7/connections", {
      signal: controller.signal,
    });
    expect(result).toEqual({ ok: true, data: { data: [] } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 500));

    const result = await fetchConnectionsForAppUser(7);

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 502 }));

    const result = await fetchConnectionsForAppUser(7);

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(fetchConnectionsForAppUser(7)).rejects.toThrow("network down");
  });
});

describe("postAppUser", () => {
  it("POSTs the JSON payload to /api/apps-users", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }, 201));
    const payload = { name: "svc", description: "desc" };

    const result = await postAppUser(payload);

    expect(fetchMock).toHaveBeenCalledWith("/api/apps-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ ok: true, data: { ok: true } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 400));

    const result = await postAppUser({ name: "svc", description: "desc" });

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));

    const result = await postAppUser({ name: "svc", description: "desc" });

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(postAppUser({ name: "svc", description: "desc" })).rejects.toThrow("network down");
  });
});

describe("postConnectionForAppUser", () => {
  it("POSTs the JSON payload to /api/apps-users/7/connections", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }, 201));
    const payload = { originApplicationId: 1, destinationApplicationId: 2 };

    const result = await postConnectionForAppUser(7, payload);

    expect(fetchMock).toHaveBeenCalledWith("/api/apps-users/7/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ ok: true, data: { ok: true } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 400));

    const result = await postConnectionForAppUser(7, { originApplicationId: 1, destinationApplicationId: 2 });

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));

    const result = await postConnectionForAppUser(7, { originApplicationId: 1, destinationApplicationId: 2 });

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(postConnectionForAppUser(7, { originApplicationId: 1, destinationApplicationId: 2 })).rejects.toThrow("network down");
  });
});

describe("postAssignApplicationToAppUser", () => {
  it("POSTs the JSON payload to /api/apps-users/7/applications", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }, 201));
    const payload = { applicationId: 2 };

    const result = await postAssignApplicationToAppUser(7, payload);

    expect(fetchMock).toHaveBeenCalledWith("/api/apps-users/7/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ ok: true, data: { ok: true } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 400));

    const result = await postAssignApplicationToAppUser(7, { applicationId: 2 });

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));

    const result = await postAssignApplicationToAppUser(7, { applicationId: 2 });

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(postAssignApplicationToAppUser(7, { applicationId: 2 })).rejects.toThrow("network down");
  });
});

describe("postAssignRoleToAppUser", () => {
  it("POSTs the JSON payload to /api/apps-users/7/roles", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }, 201));
    const payload = { roleId: 3 };

    const result = await postAssignRoleToAppUser(7, payload);

    expect(fetchMock).toHaveBeenCalledWith("/api/apps-users/7/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result).toEqual({ ok: true, data: { ok: true } });
  });

  it("returns ok false with the error body on failure", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, 400));

    const result = await postAssignRoleToAppUser(7, { roleId: 3 });

    expect(result).toEqual({ ok: false, data: { message: "boom" } });
  });

  it("returns null data when the body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));

    const result = await postAssignRoleToAppUser(7, { roleId: 3 });

    expect(result).toEqual({ ok: false, data: null });
  });

  it("propagates network failures", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(postAssignRoleToAppUser(7, { roleId: 3 })).rejects.toThrow("network down");
  });
});
