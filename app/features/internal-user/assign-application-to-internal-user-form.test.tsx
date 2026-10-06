import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getApplications } from "@/app/features/application/application.service";
import { assignApplicationToInternalUser, getInternalUsers } from "./internal-user.service";
import { AssignApplicationToInternalUserForm } from "./assign-application-to-internal-user-form";

vi.mock("@/app/features/application/application.service");
vi.mock("./internal-user.service");

beforeEach(() => {
  vi.mocked(getInternalUsers).mockResolvedValue([
    { id: 3, name: "Ana", lastname: "Gil", email: "ana@b.com" },
  ]);
  vi.mocked(getApplications).mockResolvedValue([
    { id: 2, name: "billing", description: "d" },
  ]);
});

afterEach(() => {
  vi.resetAllMocks();
});

async function fillForm() {
  const user = userEvent.setup();
  await screen.findByRole("option", { name: "Ana Gil" });
  await screen.findByRole("option", { name: "billing" });
  await user.selectOptions(screen.getByLabelText("Usuario interno"), "3");
  await user.selectOptions(screen.getByLabelText("Aplicación"), "2");
  return user;
}

describe("AssignApplicationToInternalUserForm", () => {
  it("loads users and applications into the selects", async () => {
    render(<AssignApplicationToInternalUserForm />);

    expect(await screen.findByRole("option", { name: "Ana Gil" })).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "billing" })).toBeInTheDocument();
  });

  it("shows loading hints until both lists arrive", async () => {
    render(<AssignApplicationToInternalUserForm />);

    expect(screen.getAllByText("Cargando…")).toHaveLength(2);
    await screen.findByRole("option", { name: "billing" });
    await screen.findByRole("option", { name: "Ana Gil" });
    expect(screen.queryByText("Cargando…")).not.toBeInTheDocument();
  });

  it("shows an error when users cannot be loaded", async () => {
    vi.mocked(getInternalUsers).mockRejectedValue(new Error("Users down"));
    render(<AssignApplicationToInternalUserForm />);

    expect(await screen.findByText("Users down")).toBeInTheDocument();
  });

  it("shows an error when applications cannot be loaded", async () => {
    vi.mocked(getApplications).mockRejectedValue(new Error("Apps down"));
    render(<AssignApplicationToInternalUserForm />);

    expect(await screen.findByText("Apps down")).toBeInTheDocument();
  });

  it("keeps the submit button disabled until both selects are filled", async () => {
    render(<AssignApplicationToInternalUserForm />);
    const button = screen.getByRole("button", { name: "Asignar" });

    expect(button).toBeDisabled();

    await fillForm();

    expect(button).toBeEnabled();
  });

  it("assigns the application and shows success", async () => {
    vi.mocked(assignApplicationToInternalUser).mockResolvedValue(undefined);
    render(<AssignApplicationToInternalUserForm />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Asignar" }));

    expect(
      await screen.findByText("Aplicación asignada correctamente."),
    ).toBeInTheDocument();
    expect(assignApplicationToInternalUser).toHaveBeenCalledWith("3", {
      applicationId: 2,
    });
    expect(screen.getByLabelText("Usuario interno")).toHaveValue("");
  });

  it("shows the error when the assignment fails", async () => {
    vi.mocked(assignApplicationToInternalUser).mockRejectedValue(
      new Error("Already assigned"),
    );
    render(<AssignApplicationToInternalUserForm />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Asignar" }));

    expect(await screen.findByText("Already assigned")).toBeInTheDocument();
    expect(
      screen.queryByText("Aplicación asignada correctamente."),
    ).not.toBeInTheDocument();
  });
});
