import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchApplications,
  postApplication,
} from "../application.connector";
import {
  getApplications,
  createApplication,
} from "../application.service";

vi.mock("../application.connector");

afterEach(() => {
  vi.resetAllMocks();
});

describe("getApplications", () => {
  it("returns the list from the connector and forwards its arguments", async () => {
    vi.mocked(fetchApplications).mockResolvedValue({ ok: true, data: { data: [{ id: 1, name: "app", description: "d" }] } } as never);
    const controller = new AbortController();

    const result = await getApplications(controller.signal);

    expect(result).toEqual([{ id: 1, name: "app", description: "d" }]);
    expect(fetchApplications).toHaveBeenCalledWith(controller.signal);
  });

  it("returns an empty list when the response has no data", async () => {
    vi.mocked(fetchApplications).mockResolvedValue({ ok: true, data: null } as never);

    expect(await getApplications()).toEqual([]);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(fetchApplications).mockResolvedValue({
      ok: false,
      data: { message: "Forbidden" },
    } as never);

    await expect(getApplications()).rejects.toThrow("Forbidden");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(fetchApplications).mockResolvedValue({ ok: false, data: null } as never);

    await expect(getApplications()).rejects.toThrow("No se pudieron obtener las aplicaciones.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(fetchApplications).mockRejectedValue(new Error("network down"));

    await expect(getApplications()).rejects.toThrow("No se pudo conectar con el servidor.");
  });

  it("rethrows the original error when the request was aborted", async () => {
    const abortError = new Error("aborted");
    vi.mocked(fetchApplications).mockRejectedValue(abortError);
    const controller = new AbortController();
    controller.abort();

    await expect(getApplications(controller.signal)).rejects.toBe(abortError);
  });
});

describe("createApplication", () => {
  const payload = { name: "app", description: "desc" };

  it("returns the created application", async () => {
    vi.mocked(postApplication).mockResolvedValue({ ok: true, data: { data: { id: 1, name: "app", description: "desc" } } } as never);

    const result = await createApplication(payload);

    expect(result).toEqual({ id: 1, name: "app", description: "desc" });
    expect(postApplication).toHaveBeenCalledWith(payload);
  });

  it("returns null when the response has no data", async () => {
    vi.mocked(postApplication).mockResolvedValue({ ok: true, data: null } as never);

    expect(await createApplication(payload)).toEqual(null);
  });

  it("throws the server message when the response is not ok", async () => {
    vi.mocked(postApplication).mockResolvedValue({
      ok: false,
      data: { message: "Invalid" },
    } as never);

    await expect(createApplication(payload)).rejects.toThrow("Invalid");
  });

  it("throws a fallback message when the error has no message", async () => {
    vi.mocked(postApplication).mockResolvedValue({ ok: false, data: null } as never);

    await expect(createApplication(payload)).rejects.toThrow("No se pudo crear la aplicación.");
  });

  it("throws a connection error when the request fails", async () => {
    vi.mocked(postApplication).mockRejectedValue(new Error("network down"));

    await expect(createApplication(payload)).rejects.toThrow("No se pudo conectar con el servidor.");
  });
});
