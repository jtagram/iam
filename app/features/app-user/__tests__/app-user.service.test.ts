import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchAppUsers,
  fetchAssignedApplications,
  fetchConnectionsForAppUser,
  postAppUser,
  postConnectionForAppUser,
  postAssignApplicationToAppUser,
  postAssignRoleToAppUser,
} from "../app-user.connector";
import {
  getAppUsers,
  getAssignedApplicationsForAppUser,
  getConnectionsForAppUser,
  createAppUser,
  createConnectionForAppUser,
  assignApplicationToAppUser,
  assignRoleToAppUser,
} from "../app-user.service";

vi.mock("../app-user.connector");

afterEach(() => {
  vi.resetAllMocks();
});

describe("getAppUsers", () => {
  it("returns the list from the connector and forwards its arguments", async () => {
    vi.mocked(fetchAppUsers).mockResolvedValue({ ok: true, data: { data: [{ id: 1, clienteId: "c1", name: "svc", description: "d" }] } } as never);
    const controller = new AbortController();

    const result = await getAppUsers(controller.signal);

    expect(result).toEqual([{ id: 1, clienteId: "c1", name: "svc", description: "d" }]);
    expect(fetchAppUsers).toHaveBeenCalledWith(controller.signal);
  });

  it("returns an empty list when the response has no data", async () => {
    vi.mocked(fetchAppUsers).mockResolvedValue({ ok: true, data: null } as never);

    expect(await getAppUsers()).toEqual([]);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(fetchAppUsers).mockResolvedValue({
      ok: false,
      data: { message: "Forbidden" },
    } as never);

    await expect(getAppUsers()).rejects.toThrow("Forbidden");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(fetchAppUsers).mockResolvedValue({ ok: false, data: null } as never);

    await expect(getAppUsers()).rejects.toThrow("No se pudieron obtener los usuarios de aplicación.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(fetchAppUsers).mockRejectedValue(new Error("network down"));

    await expect(getAppUsers()).rejects.toThrow("No se pudo conectar con el servidor.");
  });

  it("rethrows the original error when the request was aborted", async () => {
    const abortError = new Error("aborted");
    vi.mocked(fetchAppUsers).mockRejectedValue(abortError);
    const controller = new AbortController();
    controller.abort();

    await expect(getAppUsers(controller.signal)).rejects.toBe(abortError);
  });
});

describe("getAssignedApplicationsForAppUser", () => {
  it("returns the list from the connector and forwards its arguments", async () => {
    vi.mocked(fetchAssignedApplications).mockResolvedValue({ ok: true, data: { data: [{ applicationId: 2, applicationName: "app", applicationDescription: "d", roles: [] }] } } as never);
    const controller = new AbortController();

    const result = await getAssignedApplicationsForAppUser(7, controller.signal);

    expect(result).toEqual([{ applicationId: 2, applicationName: "app", applicationDescription: "d", roles: [] }]);
    expect(fetchAssignedApplications).toHaveBeenCalledWith(7, controller.signal);
  });

  it("returns an empty list when the response has no data", async () => {
    vi.mocked(fetchAssignedApplications).mockResolvedValue({ ok: true, data: null } as never);

    expect(await getAssignedApplicationsForAppUser(7)).toEqual([]);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(fetchAssignedApplications).mockResolvedValue({
      ok: false,
      data: { message: "Forbidden" },
    } as never);

    await expect(getAssignedApplicationsForAppUser(7)).rejects.toThrow("Forbidden");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(fetchAssignedApplications).mockResolvedValue({ ok: false, data: null } as never);

    await expect(getAssignedApplicationsForAppUser(7)).rejects.toThrow("No se pudieron obtener las aplicaciones asignadas.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(fetchAssignedApplications).mockRejectedValue(new Error("network down"));

    await expect(getAssignedApplicationsForAppUser(7)).rejects.toThrow("No se pudo conectar con el servidor.");
  });

  it("rethrows the original error when the request was aborted", async () => {
    const abortError = new Error("aborted");
    vi.mocked(fetchAssignedApplications).mockRejectedValue(abortError);
    const controller = new AbortController();
    controller.abort();

    await expect(getAssignedApplicationsForAppUser(7, controller.signal)).rejects.toBe(abortError);
  });
});

describe("getConnectionsForAppUser", () => {
  it("returns the list from the connector and forwards its arguments", async () => {
    vi.mocked(fetchConnectionsForAppUser).mockResolvedValue({ ok: true, data: { data: [{ id: 1, originApplicationId: 1, originApplicationName: "a", destinationApplicationId: 2, destinationApplicationName: "b" }] } } as never);
    const controller = new AbortController();

    const result = await getConnectionsForAppUser(7, controller.signal);

    expect(result).toEqual([{ id: 1, originApplicationId: 1, originApplicationName: "a", destinationApplicationId: 2, destinationApplicationName: "b" }]);
    expect(fetchConnectionsForAppUser).toHaveBeenCalledWith(7, controller.signal);
  });

  it("returns an empty list when the response has no data", async () => {
    vi.mocked(fetchConnectionsForAppUser).mockResolvedValue({ ok: true, data: null } as never);

    expect(await getConnectionsForAppUser(7)).toEqual([]);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(fetchConnectionsForAppUser).mockResolvedValue({
      ok: false,
      data: { message: "Forbidden" },
    } as never);

    await expect(getConnectionsForAppUser(7)).rejects.toThrow("Forbidden");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(fetchConnectionsForAppUser).mockResolvedValue({ ok: false, data: null } as never);

    await expect(getConnectionsForAppUser(7)).rejects.toThrow("No se pudieron obtener las conexiones.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(fetchConnectionsForAppUser).mockRejectedValue(new Error("network down"));

    await expect(getConnectionsForAppUser(7)).rejects.toThrow("No se pudo conectar con el servidor.");
  });

  it("rethrows the original error when the request was aborted", async () => {
    const abortError = new Error("aborted");
    vi.mocked(fetchConnectionsForAppUser).mockRejectedValue(abortError);
    const controller = new AbortController();
    controller.abort();

    await expect(getConnectionsForAppUser(7, controller.signal)).rejects.toBe(abortError);
  });
});

describe("createAppUser", () => {
  const payload = { name: "svc", description: "desc" };

  it("returns the created user", async () => {
    vi.mocked(postAppUser).mockResolvedValue({ ok: true, data: { data: { id: 1, clienteId: "c1", clienteSecret: "s", name: "svc", description: "desc" } } } as never);

    const result = await createAppUser(payload);

    expect(result).toEqual({ id: 1, clienteId: "c1", clienteSecret: "s", name: "svc", description: "desc" });
    expect(postAppUser).toHaveBeenCalledWith(payload);
  });

  it("throws when the response has no created user", async () => {
    vi.mocked(postAppUser).mockResolvedValue({ ok: true, data: null } as never);

    await expect(createAppUser(payload)).rejects.toThrow("No se pudo crear el usuario de aplicación.");
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(postAppUser).mockResolvedValue({
      ok: false,
      data: { message: "Invalid" },
    } as never);

    await expect(createAppUser(payload)).rejects.toThrow("Invalid");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(postAppUser).mockResolvedValue({ ok: false, data: null } as never);

    await expect(createAppUser(payload)).rejects.toThrow("No se pudo crear el usuario de aplicación.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(postAppUser).mockRejectedValue(new Error("network down"));

    await expect(createAppUser(payload)).rejects.toThrow("No se pudo conectar con el servidor.");
  });
});

describe("createConnectionForAppUser", () => {
  const payload = { originApplicationId: 1, destinationApplicationId: 2 };

  it("resolves without a value on success", async () => {
    vi.mocked(postConnectionForAppUser).mockResolvedValue({ ok: true, data: {} } as never);

    const result = await createConnectionForAppUser(7, payload);

    expect(result).toEqual(undefined);
    expect(postConnectionForAppUser).toHaveBeenCalledWith(7, payload);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(postConnectionForAppUser).mockResolvedValue({
      ok: false,
      data: { message: "Invalid" },
    } as never);

    await expect(createConnectionForAppUser(7, payload)).rejects.toThrow("Invalid");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(postConnectionForAppUser).mockResolvedValue({ ok: false, data: null } as never);

    await expect(createConnectionForAppUser(7, payload)).rejects.toThrow("No se pudo crear la conexión.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(postConnectionForAppUser).mockRejectedValue(new Error("network down"));

    await expect(createConnectionForAppUser(7, payload)).rejects.toThrow("No se pudo conectar con el servidor.");
  });
});

describe("assignApplicationToAppUser", () => {
  const payload = { applicationId: 2 };

  it("resolves without a value on success", async () => {
    vi.mocked(postAssignApplicationToAppUser).mockResolvedValue({ ok: true, data: {} } as never);

    const result = await assignApplicationToAppUser(7, payload);

    expect(result).toEqual(undefined);
    expect(postAssignApplicationToAppUser).toHaveBeenCalledWith(7, payload);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(postAssignApplicationToAppUser).mockResolvedValue({
      ok: false,
      data: { message: "Invalid" },
    } as never);

    await expect(assignApplicationToAppUser(7, payload)).rejects.toThrow("Invalid");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(postAssignApplicationToAppUser).mockResolvedValue({ ok: false, data: null } as never);

    await expect(assignApplicationToAppUser(7, payload)).rejects.toThrow("No se pudo asignar la aplicación.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(postAssignApplicationToAppUser).mockRejectedValue(new Error("network down"));

    await expect(assignApplicationToAppUser(7, payload)).rejects.toThrow("No se pudo conectar con el servidor.");
  });
});

describe("assignRoleToAppUser", () => {
  const payload = { roleId: 3 };

  it("resolves without a value on success", async () => {
    vi.mocked(postAssignRoleToAppUser).mockResolvedValue({ ok: true, data: {} } as never);

    const result = await assignRoleToAppUser(7, payload);

    expect(result).toEqual(undefined);
    expect(postAssignRoleToAppUser).toHaveBeenCalledWith(7, payload);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(postAssignRoleToAppUser).mockResolvedValue({
      ok: false,
      data: { message: "Invalid" },
    } as never);

    await expect(assignRoleToAppUser(7, payload)).rejects.toThrow("Invalid");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(postAssignRoleToAppUser).mockResolvedValue({ ok: false, data: null } as never);

    await expect(assignRoleToAppUser(7, payload)).rejects.toThrow("No se pudo asignar el rol.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(postAssignRoleToAppUser).mockRejectedValue(new Error("network down"));

    await expect(assignRoleToAppUser(7, payload)).rejects.toThrow("No se pudo conectar con el servidor.");
  });
});
