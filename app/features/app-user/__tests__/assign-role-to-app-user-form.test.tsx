import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getApplications } from "@/app/features/application/application.service";
import { getRolesByApplication } from "@/app/features/role/role.service";
import { assignRoleToAppUser, getAppUsers } from "../app-user.service";
import { AssignRoleToAppUserForm } from "../assign-role-to-app-user-form";

vi.mock("@/app/features/application/application.service");
vi.mock("@/app/features/role/role.service");
vi.mock("../app-user.service");

beforeEach(() => {
  vi.mocked(getAppUsers).mockResolvedValue([
    { id: 3, clienteId: "c3", name: "svc-three", description: "d" },
  ]);
  vi.mocked(getApplications).mockResolvedValue([
    { id: 2, name: "billing", description: "d" },
    { id: 4, name: "crm", description: "d" },
  ]);
  vi.mocked(getRolesByApplication).mockImplementation(async (id) =>
    String(id) === "2"
      ? [{ id: 8, applicationId: 2, name: "admin", description: "d" }]
      : [{ id: 9, applicationId: 4, name: "viewer", description: "d" }],
  );
});

afterEach(() => {
  vi.resetAllMocks();
});

async function fillForm() {
  const user = userEvent.setup();
  await screen.findByRole("option", { name: "svc-three" });
  await screen.findByRole("option", { name: "billing" });
  await user.selectOptions(screen.getByLabelText("Usuario de aplicación"), "3");
  await user.selectOptions(screen.getByLabelText("Aplicación"), "2");
  await screen.findByRole("option", { name: "admin" });
  await user.selectOptions(screen.getByLabelText("Rol"), "8");
  return user;
}

describe("AssignRoleToAppUserForm", () => {
  it("asks to pick an application before roles are available", () => {
    render(<AssignRoleToAppUserForm />);

    expect(
      screen.getByText("Seleccioná una aplicación primero."),
    ).toBeInTheDocument();
    expect(getRolesByApplication).not.toHaveBeenCalled();
  });

  it("loads the roles of the selected application", async () => {
    render(<AssignRoleToAppUserForm />);
    const user = userEvent.setup();
    await screen.findByRole("option", { name: "crm" });

    await user.selectOptions(screen.getByLabelText("Aplicación"), "4");

    expect(await screen.findByRole("option", { name: "viewer" })).toBeInTheDocument();
    expect(getRolesByApplication).toHaveBeenCalledWith("4", expect.any(AbortSignal));
    expect(
      screen.queryByText("Seleccioná una aplicación primero."),
    ).not.toBeInTheDocument();
  });

  it("shows an error when roles cannot be loaded", async () => {
    vi.mocked(getRolesByApplication).mockRejectedValue(new Error("Roles down"));
    render(<AssignRoleToAppUserForm />);
    const user = userEvent.setup();
    await screen.findByRole("option", { name: "billing" });

    await user.selectOptions(screen.getByLabelText("Aplicación"), "2");

    expect(await screen.findByText("Roles down")).toBeInTheDocument();
  });

  it("shows an error when users cannot be loaded", async () => {
    vi.mocked(getAppUsers).mockRejectedValue(new Error("Users down"));
    render(<AssignRoleToAppUserForm />);

    expect(await screen.findByText("Users down")).toBeInTheDocument();
  });

  it("shows an error when applications cannot be loaded", async () => {
    vi.mocked(getApplications).mockRejectedValue(new Error("Apps down"));
    render(<AssignRoleToAppUserForm />);

    expect(await screen.findByText("Apps down")).toBeInTheDocument();
  });

  it("resets the selected role when the application changes", async () => {
    render(<AssignRoleToAppUserForm />);

    const user = await fillForm();
    expect(screen.getByLabelText("Rol")).toHaveValue("8");

    await user.selectOptions(screen.getByLabelText("Aplicación"), "4");

    await screen.findByRole("option", { name: "viewer" });
    expect(screen.getByLabelText("Rol")).toHaveValue("");
  });

  it("assigns the role and shows success", async () => {
    vi.mocked(assignRoleToAppUser).mockResolvedValue(undefined);
    render(<AssignRoleToAppUserForm />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Asignar" }));

    expect(
      await screen.findByText("Rol asignado correctamente."),
    ).toBeInTheDocument();
    expect(assignRoleToAppUser).toHaveBeenCalledWith("3", { roleId: 8 });
  });

  it("shows the error when the assignment fails", async () => {
    vi.mocked(assignRoleToAppUser).mockRejectedValue(new Error("Already assigned"));
    render(<AssignRoleToAppUserForm />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Asignar" }));

    expect(await screen.findByText("Already assigned")).toBeInTheDocument();
  });

  it("keeps the submit button disabled until the form is complete", async () => {
    render(<AssignRoleToAppUserForm />);

    expect(screen.getByRole("button", { name: "Asignar" })).toBeDisabled();

    await fillForm();

    expect(screen.getByRole("button", { name: "Asignar" })).toBeEnabled();
  });
});
