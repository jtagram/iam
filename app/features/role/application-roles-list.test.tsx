import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getApplications } from "@/app/features/application/application.service";
import { getRolesByApplication } from "./role.service";
import { ApplicationRolesList } from "./application-roles-list";

vi.mock("@/app/features/application/application.service");
vi.mock("./role.service");

afterEach(() => {
  vi.resetAllMocks();
});

describe("ApplicationRolesList", () => {
  it("shows a loading message while fetching", () => {
    vi.mocked(getApplications).mockReturnValue(new Promise(() => {}));
    render(<ApplicationRolesList />);

    expect(screen.getByText("Cargando…")).toBeInTheDocument();
  });

  it("renders each application with its comma separated roles", async () => {
    vi.mocked(getApplications).mockResolvedValue([
      { id: 1, name: "billing", description: "d" },
      { id: 2, name: "crm", description: "d" },
    ]);
    vi.mocked(getRolesByApplication).mockImplementation(async (id) =>
      id === 1
        ? [
            { id: 10, applicationId: 1, name: "admin", description: "d" },
            { id: 11, applicationId: 1, name: "editor", description: "d" },
          ]
        : [],
    );
    render(<ApplicationRolesList />);

    expect(await screen.findByText("billing:admin,editor")).toBeInTheDocument();
    expect(screen.getByText("crm:")).toBeInTheDocument();
    expect(getRolesByApplication).toHaveBeenCalledWith(
      1,
      expect.any(AbortSignal),
    );
  });

  it("shows an empty message when there are no applications", async () => {
    vi.mocked(getApplications).mockResolvedValue([]);
    render(<ApplicationRolesList />);

    expect(
      await screen.findByText("No hay aplicaciones creadas todavía."),
    ).toBeInTheDocument();
  });

  it("shows the error when loading applications fails", async () => {
    vi.mocked(getApplications).mockRejectedValue(new Error("Forbidden"));
    render(<ApplicationRolesList />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Forbidden");
  });

  it("shows the error when loading roles fails", async () => {
    vi.mocked(getApplications).mockResolvedValue([
      { id: 1, name: "billing", description: "d" },
    ]);
    vi.mocked(getRolesByApplication).mockRejectedValue(new Error("Roles down"));
    render(<ApplicationRolesList />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Roles down");
  });

  it("aborts the request when unmounted", () => {
    vi.mocked(getApplications).mockReturnValue(new Promise(() => {}));
    const { unmount } = render(<ApplicationRolesList />);

    const signal = vi.mocked(getApplications).mock.calls[0][0] as AbortSignal;
    unmount();

    expect(signal.aborted).toBe(true);
  });
});
