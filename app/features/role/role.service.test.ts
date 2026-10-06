import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchRolesByApplication,
  postRole,
} from "./role.connector";
import {
  getRolesByApplication,
  createRole,
} from "./role.service";

vi.mock("./role.connector");

afterEach(() => {
  vi.resetAllMocks();
});

describe("getRolesByApplication", () => {
  it("returns the list from the connector and forwards its arguments", async () => {
    vi.mocked(fetchRolesByApplication).mockResolvedValue({ ok: true, data: { data: [{ id: 1, applicationId: 5, name: "admin", description: "d" }] } } as never);
    const controller = new AbortController();

    const result = await getRolesByApplication(5, controller.signal);

    expect(result).toEqual([{ id: 1, applicationId: 5, name: "admin", description: "d" }]);
    expect(fetchRolesByApplication).toHaveBeenCalledWith(5, controller.signal);
  });

  it("returns an empty list when the response has no data", async () => {
    vi.mocked(fetchRolesByApplication).mockResolvedValue({ ok: true, data: null } as never);

    expect(await getRolesByApplication(5)).toEqual([]);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(fetchRolesByApplication).mockResolvedValue({
      ok: false,
      data: { message: "Forbidden" },
    } as never);

    await expect(getRolesByApplication(5)).rejects.toThrow("Forbidden");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(fetchRolesByApplication).mockResolvedValue({ ok: false, data: null } as never);

    await expect(getRolesByApplication(5)).rejects.toThrow("No se pudieron obtener los roles.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(fetchRolesByApplication).mockRejectedValue(new Error("network down"));

    await expect(getRolesByApplication(5)).rejects.toThrow("No se pudo conectar con el servidor.");
  });

  it("rethrows the original error when the request was aborted", async () => {
    const abortError = new Error("aborted");
    vi.mocked(fetchRolesByApplication).mockRejectedValue(abortError);
    const controller = new AbortController();
    controller.abort();

    await expect(getRolesByApplication(5, controller.signal)).rejects.toBe(abortError);
  });
});

describe("createRole", () => {
  const payload = { applicationId: 5, name: "admin", description: "desc" };

  it("returns the created role", async () => {
    vi.mocked(postRole).mockResolvedValue({ ok: true, data: { data: { id: 1, applicationId: 5, name: "admin", description: "desc" } } } as never);

    const result = await createRole(payload);

    expect(result).toEqual({ id: 1, applicationId: 5, name: "admin", description: "desc" });
    expect(postRole).toHaveBeenCalledWith(payload);
  });

  it("returns null when the response has no data", async () => {
    vi.mocked(postRole).mockResolvedValue({ ok: true, data: null } as never);

    expect(await createRole(payload)).toEqual(null);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(postRole).mockResolvedValue({
      ok: false,
      data: { message: "Invalid" },
    } as never);

    await expect(createRole(payload)).rejects.toThrow("Invalid");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(postRole).mockResolvedValue({ ok: false, data: null } as never);

    await expect(createRole(payload)).rejects.toThrow("No se pudo crear el rol.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(postRole).mockRejectedValue(new Error("network down"));

    await expect(createRole(payload)).rejects.toThrow("No se pudo conectar con el servidor.");
  });
});
