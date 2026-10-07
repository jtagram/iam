import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchInternalUsers,
  fetchAssignedApplicationsForInternalUser,
  fetchConnectionsForInternalUser,
  postInternalUser,
  postConnectionForInternalUser,
  postAssignApplicationToInternalUser,
  postAssignRoleToInternalUser,
} from "../internal-user.connector";
import {
  getInternalUsers,
  getAssignedApplicationsForInternalUser,
  getConnectionsForInternalUser,
  createInternalUser,
  createConnectionForInternalUser,
  assignApplicationToInternalUser,
  assignRoleToInternalUser,
} from "../internal-user.service";

vi.mock("../internal-user.connector");

afterEach(() => {
  vi.resetAllMocks();
});

describe("getInternalUsers", () => {
  it("returns the list from the connector and forwards its arguments", async () => {
    vi.mocked(fetchInternalUsers).mockResolvedValue({ ok: true, data: [{ id: 1, name: "Ana", lastname: "Gil", email: "a@b.com" }] } as never);
    const controller = new AbortController();

    const result = await getInternalUsers(controller.signal);

    expect(result).toEqual([{ id: 1, name: "Ana", lastname: "Gil", email: "a@b.com" }]);
    expect(fetchInternalUsers).toHaveBeenCalledWith(controller.signal);
  });

  it("returns an empty list when the response has no data", async () => {
    vi.mocked(fetchInternalUsers).mockResolvedValue({ ok: true, data: null } as never);

    expect(await getInternalUsers()).toEqual([]);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(fetchInternalUsers).mockResolvedValue({
      ok: false,
      data: { message: "Forbidden" },
    } as never);

    await expect(getInternalUsers()).rejects.toThrow("Forbidden");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(fetchInternalUsers).mockResolvedValue({ ok: false, data: null } as never);

    await expect(getInternalUsers()).rejects.toThrow("No se pudieron obtener los usuarios internos.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(fetchInternalUsers).mockRejectedValue(new Error("network down"));

    await expect(getInternalUsers()).rejects.toThrow("No se pudo conectar con el servidor.");
  });

  it("rethrows the original error when the request was aborted", async () => {
    const abortError = new Error("aborted");
    vi.mocked(fetchInternalUsers).mockRejectedValue(abortError);
    const controller = new AbortController();
    controller.abort();

    await expect(getInternalUsers(controller.signal)).rejects.toBe(abortError);
  });
});

describe("getAssignedApplicationsForInternalUser", () => {
  it("returns the list from the connector and forwards its arguments", async () => {
    vi.mocked(fetchAssignedApplicationsForInternalUser).mockResolvedValue({ ok: true, data: [{ applicationId: 2, applicationName: "app", applicationDescription: "d", roles: [] }] } as never);
    const controller = new AbortController();

    const result = await getAssignedApplicationsForInternalUser(7, controller.signal);

    expect(result).toEqual([{ applicationId: 2, applicationName: "app", applicationDescription: "d", roles: [] }]);
    expect(fetchAssignedApplicationsForInternalUser).toHaveBeenCalledWith(7, controller.signal);
  });

  it("returns an empty list when the response has no data", async () => {
    vi.mocked(fetchAssignedApplicationsForInternalUser).mockResolvedValue({ ok: true, data: null } as never);

    expect(await getAssignedApplicationsForInternalUser(7)).toEqual([]);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(fetchAssignedApplicationsForInternalUser).mockResolvedValue({
      ok: false,
      data: { message: "Forbidden" },
    } as never);

    await expect(getAssignedApplicationsForInternalUser(7)).rejects.toThrow("Forbidden");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(fetchAssignedApplicationsForInternalUser).mockResolvedValue({ ok: false, data: null } as never);

    await expect(getAssignedApplicationsForInternalUser(7)).rejects.toThrow("No se pudieron obtener las aplicaciones asignadas.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(fetchAssignedApplicationsForInternalUser).mockRejectedValue(new Error("network down"));

    await expect(getAssignedApplicationsForInternalUser(7)).rejects.toThrow("No se pudo conectar con el servidor.");
  });

  it("rethrows the original error when the request was aborted", async () => {
    const abortError = new Error("aborted");
    vi.mocked(fetchAssignedApplicationsForInternalUser).mockRejectedValue(abortError);
    const controller = new AbortController();
    controller.abort();

    await expect(getAssignedApplicationsForInternalUser(7, controller.signal)).rejects.toBe(abortError);
  });
});

describe("getConnectionsForInternalUser", () => {
  it("returns the list from the connector and forwards its arguments", async () => {
    vi.mocked(fetchConnectionsForInternalUser).mockResolvedValue({ ok: true, data: [{ id: 1, originApplicationId: 1, originApplicationName: "a", destinationApplicationId: 2, destinationApplicationName: "b" }] } as never);
    const controller = new AbortController();

    const result = await getConnectionsForInternalUser(7, controller.signal);

    expect(result).toEqual([{ id: 1, originApplicationId: 1, originApplicationName: "a", destinationApplicationId: 2, destinationApplicationName: "b" }]);
    expect(fetchConnectionsForInternalUser).toHaveBeenCalledWith(7, controller.signal);
  });

  it("returns an empty list when the response has no data", async () => {
    vi.mocked(fetchConnectionsForInternalUser).mockResolvedValue({ ok: true, data: null } as never);

    expect(await getConnectionsForInternalUser(7)).toEqual([]);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(fetchConnectionsForInternalUser).mockResolvedValue({
      ok: false,
      data: { message: "Forbidden" },
    } as never);

    await expect(getConnectionsForInternalUser(7)).rejects.toThrow("Forbidden");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(fetchConnectionsForInternalUser).mockResolvedValue({ ok: false, data: null } as never);

    await expect(getConnectionsForInternalUser(7)).rejects.toThrow("No se pudieron obtener las conexiones.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(fetchConnectionsForInternalUser).mockRejectedValue(new Error("network down"));

    await expect(getConnectionsForInternalUser(7)).rejects.toThrow("No se pudo conectar con el servidor.");
  });

  it("rethrows the original error when the request was aborted", async () => {
    const abortError = new Error("aborted");
    vi.mocked(fetchConnectionsForInternalUser).mockRejectedValue(abortError);
    const controller = new AbortController();
    controller.abort();

    await expect(getConnectionsForInternalUser(7, controller.signal)).rejects.toBe(abortError);
  });
});

describe("createInternalUser", () => {
  const payload = { name: "Ana", lastname: "Gil", email: "a@b.com", password: "secret" };

  it("returns the created user", async () => {
    vi.mocked(postInternalUser).mockResolvedValue({ ok: true, data: { id: 1, name: "Ana", lastname: "Gil", email: "a@b.com" } } as never);

    const result = await createInternalUser(payload);

    expect(result).toEqual({ id: 1, name: "Ana", lastname: "Gil", email: "a@b.com" });
    expect(postInternalUser).toHaveBeenCalledWith(payload);
  });

  it("returns an empty object when the response has no body", async () => {
    vi.mocked(postInternalUser).mockResolvedValue({ ok: true, data: null } as never);

    expect(await createInternalUser(payload)).toEqual({});
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(postInternalUser).mockResolvedValue({
      ok: false,
      data: { message: "Invalid" },
    } as never);

    await expect(createInternalUser(payload)).rejects.toThrow("Invalid");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(postInternalUser).mockResolvedValue({ ok: false, data: null } as never);

    await expect(createInternalUser(payload)).rejects.toThrow("No se pudo crear el usuario interno.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(postInternalUser).mockRejectedValue(new Error("network down"));

    await expect(createInternalUser(payload)).rejects.toThrow("No se pudo conectar con el servidor.");
  });
});

describe("createConnectionForInternalUser", () => {
  const payload = { originApplicationId: 1, destinationApplicationId: 2 };

  it("resolves without a value on success", async () => {
    vi.mocked(postConnectionForInternalUser).mockResolvedValue({ ok: true, data: {} } as never);

    const result = await createConnectionForInternalUser(7, payload);

    expect(result).toEqual(undefined);
    expect(postConnectionForInternalUser).toHaveBeenCalledWith(7, payload);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(postConnectionForInternalUser).mockResolvedValue({
      ok: false,
      data: { message: "Invalid" },
    } as never);

    await expect(createConnectionForInternalUser(7, payload)).rejects.toThrow("Invalid");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(postConnectionForInternalUser).mockResolvedValue({ ok: false, data: null } as never);

    await expect(createConnectionForInternalUser(7, payload)).rejects.toThrow("No se pudo crear la conexión.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(postConnectionForInternalUser).mockRejectedValue(new Error("network down"));

    await expect(createConnectionForInternalUser(7, payload)).rejects.toThrow("No se pudo conectar con el servidor.");
  });
});

describe("assignApplicationToInternalUser", () => {
  const payload = { applicationId: 2 };

  it("resolves without a value on success", async () => {
    vi.mocked(postAssignApplicationToInternalUser).mockResolvedValue({ ok: true, data: {} } as never);

    const result = await assignApplicationToInternalUser(7, payload);

    expect(result).toEqual(undefined);
    expect(postAssignApplicationToInternalUser).toHaveBeenCalledWith(7, payload);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(postAssignApplicationToInternalUser).mockResolvedValue({
      ok: false,
      data: { message: "Invalid" },
    } as never);

    await expect(assignApplicationToInternalUser(7, payload)).rejects.toThrow("Invalid");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(postAssignApplicationToInternalUser).mockResolvedValue({ ok: false, data: null } as never);

    await expect(assignApplicationToInternalUser(7, payload)).rejects.toThrow("No se pudo asignar la aplicación.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(postAssignApplicationToInternalUser).mockRejectedValue(new Error("network down"));

    await expect(assignApplicationToInternalUser(7, payload)).rejects.toThrow("No se pudo conectar con el servidor.");
  });
});

describe("assignRoleToInternalUser", () => {
  const payload = { roleId: 3 };

  it("resolves without a value on success", async () => {
    vi.mocked(postAssignRoleToInternalUser).mockResolvedValue({ ok: true, data: {} } as never);

    const result = await assignRoleToInternalUser(7, payload);

    expect(result).toEqual(undefined);
    expect(postAssignRoleToInternalUser).toHaveBeenCalledWith(7, payload);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(postAssignRoleToInternalUser).mockResolvedValue({
      ok: false,
      data: { message: "Invalid" },
    } as never);

    await expect(assignRoleToInternalUser(7, payload)).rejects.toThrow("Invalid");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(postAssignRoleToInternalUser).mockResolvedValue({ ok: false, data: null } as never);

    await expect(assignRoleToInternalUser(7, payload)).rejects.toThrow("No se pudo asignar el rol.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(postAssignRoleToInternalUser).mockRejectedValue(new Error("network down"));

    await expect(assignRoleToInternalUser(7, payload)).rejects.toThrow("No se pudo conectar con el servidor.");
  });
});
