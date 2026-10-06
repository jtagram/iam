import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createConnectionForAppUser,
  getAppUsers,
  getAssignedApplicationsForAppUser,
  getConnectionsForAppUser,
} from "./app-user.service";
import { ConnectApplicationsForAppUserForm } from "./connect-applications-for-app-user-form";

vi.mock("./app-user.service");

const assigned = [
  { applicationId: 1, applicationName: "billing", applicationDescription: "d", roles: [] },
  { applicationId: 2, applicationName: "crm", applicationDescription: "d", roles: [] },
];

beforeEach(() => {
  vi.mocked(getAppUsers).mockResolvedValue([
    { id: 3, clienteId: "c3", name: "svc-three", description: "d" },
  ]);
  vi.mocked(getAssignedApplicationsForAppUser).mockResolvedValue(assigned);
  vi.mocked(getConnectionsForAppUser).mockResolvedValue([]);
});

afterEach(() => {
  vi.resetAllMocks();
});

async function selectUser() {
  const user = userEvent.setup();
  await screen.findByRole("option", { name: "svc-three" });
  await user.selectOptions(screen.getByLabelText("Usuario de aplicación"), "3");
  await waitForAssigned();
  return user;
}

async function waitForAssigned() {
  const origin = screen.getByLabelText("Aplicación origen");
  await within(origin).findByRole("option", { name: "crm" });
}

describe("ConnectApplicationsForAppUserForm", () => {
  it("disables the application selects until a user is chosen", async () => {
    render(<ConnectApplicationsForAppUserForm />);
    await screen.findByRole("option", { name: "svc-three" });

    expect(screen.getByLabelText("Aplicación origen")).toBeDisabled();
    expect(screen.getByLabelText("Aplicación destino")).toBeDisabled();
    expect(screen.queryByText("Conexiones existentes")).not.toBeInTheDocument();
  });

  it("shows an error when users cannot be loaded", async () => {
    vi.mocked(getAppUsers).mockRejectedValue(new Error("Users down"));
    render(<ConnectApplicationsForAppUserForm />);

    expect(await screen.findByText("Users down")).toBeInTheDocument();
  });

  it("loads the assigned applications of the selected user", async () => {
    render(<ConnectApplicationsForAppUserForm />);

    await selectUser();

    expect(getAssignedApplicationsForAppUser).toHaveBeenCalledWith(
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
    vi.mocked(getAssignedApplicationsForAppUser).mockRejectedValue(
      new Error("Assigned down"),
    );
    render(<ConnectApplicationsForAppUserForm />);
    const user = userEvent.setup();
    await screen.findByRole("option", { name: "svc-three" });

    await user.selectOptions(screen.getByLabelText("Usuario de aplicación"), "3");

    expect(await screen.findByText("Assigned down")).toBeInTheDocument();
    expect(screen.getByLabelText("Aplicación origen")).toBeDisabled();
  });

  it("lists the existing connections", async () => {
    vi.mocked(getConnectionsForAppUser).mockResolvedValue([
      {
        id: 1,
        originApplicationId: 1,
        originApplicationName: "billing",
        destinationApplicationId: 2,
        destinationApplicationName: "crm",
      },
    ]);
    render(<ConnectApplicationsForAppUserForm />);

    await selectUser();

    const table = await screen.findByRole("table");
    expect(within(table).getByRole("cell", { name: "billing" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "crm" })).toBeInTheDocument();
  });

  it("shows a message when the user has no connections", async () => {
    render(<ConnectApplicationsForAppUserForm />);

    await selectUser();

    expect(
      await screen.findByText("Este usuario aún no tiene conexiones."),
    ).toBeInTheDocument();
  });

  it("shows an error when connections cannot be loaded", async () => {
    vi.mocked(getConnectionsForAppUser).mockRejectedValue(new Error("Conns down"));
    render(<ConnectApplicationsForAppUserForm />);

    await selectUser();

    expect(await screen.findByText("Conns down")).toBeInTheDocument();
  });

  it("rejects the same application as origin and destination", async () => {
    render(<ConnectApplicationsForAppUserForm />);
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
    vi.mocked(createConnectionForAppUser).mockResolvedValue(undefined);
    render(<ConnectApplicationsForAppUserForm />);
    const user = await selectUser();

    await user.selectOptions(screen.getByLabelText("Aplicación origen"), "1");
    await user.selectOptions(screen.getByLabelText("Aplicación destino"), "2");
    await user.click(screen.getByRole("button", { name: "Relacionar" }));

    expect(
      await screen.findByText("Conexión creada correctamente."),
    ).toBeInTheDocument();
    expect(createConnectionForAppUser).toHaveBeenCalledWith("3", {
      originApplicationId: 1,
      destinationApplicationId: 2,
    });
    expect(getConnectionsForAppUser).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText("Aplicación origen")).toHaveValue("1");
    expect(screen.getByLabelText("Aplicación destino")).toHaveValue("");
  });

  it("shows the error when the connection cannot be created", async () => {
    vi.mocked(createConnectionForAppUser).mockRejectedValue(
      new Error("Already connected"),
    );
    render(<ConnectApplicationsForAppUserForm />);
    const user = await selectUser();

    await user.selectOptions(screen.getByLabelText("Aplicación origen"), "1");
    await user.selectOptions(screen.getByLabelText("Aplicación destino"), "2");
    await user.click(screen.getByRole("button", { name: "Relacionar" }));

    expect(await screen.findByText("Already connected")).toBeInTheDocument();
    expect(getConnectionsForAppUser).toHaveBeenCalledTimes(1);
  });
});
