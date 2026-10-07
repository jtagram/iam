import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAssignedApplicationsForInternalUser,
  getInternalUsers,
} from "../internal-user.service";
import { InternalUsersList } from "../internal-users-list";

vi.mock("../internal-user.service");

afterEach(() => {
  vi.resetAllMocks();
});

const internalUsers = [
  { id: 1, name: "Ana", lastname: "Gil", email: "ana@b.com" },
  { id: 2, name: "Luis", lastname: "Paz", email: "luis@b.com" },
];

describe("InternalUsersList", () => {
  it("shows a loading message while fetching", () => {
    vi.mocked(getInternalUsers).mockReturnValue(new Promise(() => {}));
    render(<InternalUsersList />);

    expect(screen.getByText("Cargando…")).toBeInTheDocument();
  });

  it("renders each user with email, applications and roles", async () => {
    vi.mocked(getInternalUsers).mockResolvedValue(internalUsers);
    vi.mocked(getAssignedApplicationsForInternalUser).mockImplementation(
      async (id) =>
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
    render(<InternalUsersList />);

    expect(await screen.findByText("Ana Gil")).toBeInTheDocument();
    expect(screen.getByText("ana@b.com")).toBeInTheDocument();
    expect(screen.getByText("billing: admin, editor")).toBeInTheDocument();
    expect(screen.getByText("Luis Paz")).toBeInTheDocument();
    expect(screen.getByText("Sin aplicaciones asignadas.")).toBeInTheDocument();
  });

  it("shows an empty message when there are no users", async () => {
    vi.mocked(getInternalUsers).mockResolvedValue([]);
    render(<InternalUsersList />);

    expect(
      await screen.findByText("No hay usuarios internos creados todavía."),
    ).toBeInTheDocument();
  });

  it("shows the error when loading users fails", async () => {
    vi.mocked(getInternalUsers).mockRejectedValue(new Error("Forbidden"));
    render(<InternalUsersList />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Forbidden");
  });

  it("shows the error when loading assigned applications fails", async () => {
    vi.mocked(getInternalUsers).mockResolvedValue(internalUsers);
    vi.mocked(getAssignedApplicationsForInternalUser).mockRejectedValue(
      new Error("Assigned down"),
    );
    render(<InternalUsersList />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Assigned down");
  });

  it("aborts the request when unmounted", () => {
    vi.mocked(getInternalUsers).mockReturnValue(new Promise(() => {}));
    const { unmount } = render(<InternalUsersList />);

    const signal = vi.mocked(getInternalUsers).mock.calls[0][0] as AbortSignal;
    unmount();

    expect(signal.aborted).toBe(true);
  });
});
