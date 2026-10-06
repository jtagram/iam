import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getAppUsers, getAssignedApplicationsForAppUser } from "./app-user.service";
import { AppUsersList } from "./app-users-list";

vi.mock("./app-user.service");

afterEach(() => {
  vi.resetAllMocks();
});

const appUsers = [
  { id: 1, clienteId: "c1", name: "svc-one", description: "First service" },
  { id: 2, clienteId: "c2", name: "svc-two", description: "Second service" },
];

describe("AppUsersList", () => {
  it("shows a loading message while fetching", () => {
    vi.mocked(getAppUsers).mockReturnValue(new Promise(() => {}));
    render(<AppUsersList />);

    expect(screen.getByText("Cargando…")).toBeInTheDocument();
  });

  it("renders each user with its assigned applications and roles", async () => {
    vi.mocked(getAppUsers).mockResolvedValue(appUsers);
    vi.mocked(getAssignedApplicationsForAppUser).mockImplementation(async (id) =>
      id === 1
        ? [
            {
              applicationId: 10,
              applicationName: "billing",
              applicationDescription: "d",
              roles: [
                { id: 1, name: "admin", description: "d" },
                { id: 2, name: "editor", description: "d" },
              ],
            },
          ]
        : [],
    );
    render(<AppUsersList />);

    expect(await screen.findByText("svc-one")).toBeInTheDocument();
    expect(screen.getByText("First service")).toBeInTheDocument();
    expect(screen.getByText("billing: admin, editor")).toBeInTheDocument();
    expect(screen.getByText("svc-two")).toBeInTheDocument();
    expect(screen.getByText("Sin aplicaciones asignadas.")).toBeInTheDocument();
  });

  it("shows an empty message when there are no users", async () => {
    vi.mocked(getAppUsers).mockResolvedValue([]);
    render(<AppUsersList />);

    expect(
      await screen.findByText("No hay usuarios de aplicación creados todavía."),
    ).toBeInTheDocument();
  });

  it("shows the error when loading users fails", async () => {
    vi.mocked(getAppUsers).mockRejectedValue(new Error("Forbidden"));
    render(<AppUsersList />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Forbidden");
  });

  it("shows the error when loading assigned applications fails", async () => {
    vi.mocked(getAppUsers).mockResolvedValue(appUsers);
    vi.mocked(getAssignedApplicationsForAppUser).mockRejectedValue(
      new Error("Assigned down"),
    );
    render(<AppUsersList />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Assigned down");
  });

  it("aborts the request when unmounted", () => {
    vi.mocked(getAppUsers).mockReturnValue(new Promise(() => {}));
    const { unmount } = render(<AppUsersList />);

    const signal = vi.mocked(getAppUsers).mock.calls[0][0] as AbortSignal;
    unmount();

    expect(signal.aborted).toBe(true);
  });
});
