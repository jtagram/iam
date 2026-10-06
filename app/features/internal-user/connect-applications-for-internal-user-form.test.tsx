import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createConnectionForInternalUser,
  getInternalUsers,
  getAssignedApplicationsForInternalUser,
  getConnectionsForInternalUser,
} from "./internal-user.service";
import { ConnectApplicationsForInternalUserForm } from "./connect-applications-for-internal-user-form";

vi.mock("./internal-user.service");

const assigned = [
  { applicationId: 1, applicationName: "billing", applicationDescription: "d", roles: [] },
  { applicationId: 2, applicationName: "crm", applicationDescription: "d", roles: [] },
];

beforeEach(() => {
  vi.mocked(getInternalUsers).mockResolvedValue([
    { id: 3, name: "Ana", lastname: "Gil", email: "ana@b.com" },
  ]);
  vi.mocked(getAssignedApplicationsForInternalUser).mockResolvedValue(assigned);
  vi.mocked(getConnectionsForInternalUser).mockResolvedValue([]);
});

afterEach(() => {
  vi.resetAllMocks();
});

async function selectUser() {
  const user = userEvent.setup();
  await screen.findByRole("option", { name: "Ana Gil (ana@b.com)" });
  await user.selectOptions(screen.getByLabelText("Usuario interno"), "3");
  await waitForAssigned();
  return user;
}

async function waitForAssigned() {
  const origin = screen.getByLabelText("Aplicación origen");
  await within(origin).findByRole("option", { name: "crm" });
}

describe("ConnectApplicationsForInternalUserForm", () => {
  it("disables the application selects until a user is chosen", async () => {
    render(<ConnectApplicationsForInternalUserForm />);
    await screen.findByRole("option", { name: "Ana Gil (ana@b.com)" });

    expect(screen.getByLabelText("Aplicación origen")).toBeDisabled();
    expect(screen.getByLabelText("Aplicación destino")).toBeDisabled();
    expect(screen.queryByText("Conexiones existentes")).not.toBeInTheDocument();
  });

  it("shows an error when users cannot be loaded", async () => {
    vi.mocked(getInternalUsers).mockRejectedValue(new Error("Users down"));
    render(<ConnectApplicationsForInternalUserForm />);

    expect(await screen.findByText("Users down")).toBeInTheDocument();
  });

  it("loads the assigned applications of the selected user", async () => {
    render(<ConnectApplicationsForInternalUserForm />);

    await selectUser();

    expect(getAssignedApplicationsForInternalUser).toHaveBeenCalledWith(
      "3",
      expect.any(AbortSignal),
    );
    expect(screen.getByLabelText("Aplicación origen")).toBeEnabled();
    expect(
      within(screen.getByLabelText("Aplicación destino")).getByRole("option", {
        name: "billing",
      }),
    ).toBeInTheDocument();
  });

  it("shows an error when assigned applications cannot be loaded", async () => {
    vi.mocked(getAssignedApplicationsForInternalUser).mockRejectedValue(
      new Error("Assigned down"),
    );
    render(<ConnectApplicationsForInternalUserForm />);
    const user = userEvent.setup();
    await screen.findByRole("option", { name: "Ana Gil (ana@b.com)" });

    await user.selectOptions(screen.getByLabelText("Usuario interno"), "3");

    expect(await screen.findByText("Assigned down")).toBeInTheDocument();
    expect(screen.getByLabelText("Aplicación origen")).toBeDisabled();
  });

  it("lists the existing connections", async () => {
    vi.mocked(getConnectionsForInternalUser).mockResolvedValue([
      {
        id: 1,
        originApplicationId: 1,
        originApplicationName: "billing",
        destinationApplicationId: 2,
        destinationApplicationName: "crm",
      },
    ]);
    render(<ConnectApplicationsForInternalUserForm />);

    await selectUser();

    const table = await screen.findByRole("table");
    expect(within(table).getByRole("cell", { name: "billing" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "crm" })).toBeInTheDocument();
  });

  it("shows a message when the user has no connections", async () => {
    render(<ConnectApplicationsForInternalUserForm />);

    await selectUser();

    expect(
      await screen.findByText("Este usuario aún no tiene conexiones."),
    ).toBeInTheDocument();
  });

  it("shows an error when connections cannot be loaded", async () => {
    vi.mocked(getConnectionsForInternalUser).mockRejectedValue(new Error("Conns down"));
    render(<ConnectApplicationsForInternalUserForm />);

    await selectUser();

    expect(await screen.findByText("Conns down")).toBeInTheDocument();
  });

  it("rejects the same application as origin and destination", async () => {
    render(<ConnectApplicationsForInternalUserForm />);
    const user = await selectUser();

    await user.selectOptions(screen.getByLabelText("Aplicación origen"), "1");
    await user.selectOptions(screen.getByLabelText("Aplicación destino"), "1");

    expect(
      await screen.findByText(
        "La aplicación origen y destino deben ser distintas.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Relacionar" })).toBeDisabled();
  });

  it("creates the connection, reloads connections and clears the destination", async () => {
    vi.mocked(createConnectionForInternalUser).mockResolvedValue(undefined);
    render(<ConnectApplicationsForInternalUserForm />);
    const user = await selectUser();

    await user.selectOptions(screen.getByLabelText("Aplicación origen"), "1");
    await user.selectOptions(screen.getByLabelText("Aplicación destino"), "2");
    await user.click(screen.getByRole("button", { name: "Relacionar" }));

    expect(
      await screen.findByText("Conexión creada correctamente."),
    ).toBeInTheDocument();
    expect(createConnectionForInternalUser).toHaveBeenCalledWith("3", {
      originApplicationId: 1,
      destinationApplicationId: 2,
    });
    expect(getConnectionsForInternalUser).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText("Aplicación origen")).toHaveValue("1");
    expect(screen.getByLabelText("Aplicación destino")).toHaveValue("");
  });

  it("shows the error when the connection cannot be created", async () => {
    vi.mocked(createConnectionForInternalUser).mockRejectedValue(
      new Error("Already connected"),
    );
    render(<ConnectApplicationsForInternalUserForm />);
    const user = await selectUser();

    await user.selectOptions(screen.getByLabelText("Aplicación origen"), "1");
    await user.selectOptions(screen.getByLabelText("Aplicación destino"), "2");
    await user.click(screen.getByRole("button", { name: "Relacionar" }));

    expect(await screen.findByText("Already connected")).toBeInTheDocument();
    expect(getConnectionsForInternalUser).toHaveBeenCalledTimes(1);
  });
});
