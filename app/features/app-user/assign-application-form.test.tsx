import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getApplications } from "@/app/features/application/application.service";
import { assignApplicationToAppUser, getAppUsers } from "./app-user.service";
import { AssignApplicationForm } from "./assign-application-form";

vi.mock("@/app/features/application/application.service");
vi.mock("./app-user.service");

beforeEach(() => {
  vi.mocked(getAppUsers).mockResolvedValue([
    { id: 3, clienteId: "c3", name: "svc-three", description: "d" },
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
  await screen.findByRole("option", { name: "svc-three" });
  await screen.findByRole("option", { name: "billing" });
  await user.selectOptions(screen.getByLabelText("Usuario de aplicación"), "3");
  await user.selectOptions(screen.getByLabelText("Aplicación"), "2");
  return user;
}

describe("AssignApplicationForm", () => {
  it("loads users and applications into the selects", async () => {
    render(<AssignApplicationForm />);

    expect(await screen.findByRole("option", { name: "svc-three" })).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: "billing" })).toBeInTheDocument();
  });

  it("shows loading hints until both lists arrive", async () => {
    render(<AssignApplicationForm />);

    expect(screen.getAllByText("Cargando…")).toHaveLength(2);
    await screen.findByRole("option", { name: "billing" });
    await screen.findByRole("option", { name: "svc-three" });
    expect(screen.queryByText("Cargando…")).not.toBeInTheDocument();
  });

  it("shows an error when users cannot be loaded", async () => {
    vi.mocked(getAppUsers).mockRejectedValue(new Error("Users down"));
    render(<AssignApplicationForm />);

    expect(await screen.findByText("Users down")).toBeInTheDocument();
  });

  it("shows an error when applications cannot be loaded", async () => {
    vi.mocked(getApplications).mockRejectedValue(new Error("Apps down"));
    render(<AssignApplicationForm />);

    expect(await screen.findByText("Apps down")).toBeInTheDocument();
  });

  it("keeps the submit button disabled until both selects are filled", async () => {
    render(<AssignApplicationForm />);
    const button = screen.getByRole("button", { name: "Asignar" });

    expect(button).toBeDisabled();

    await fillForm();

    expect(button).toBeEnabled();
  });

  it("assigns the application and shows success", async () => {
    vi.mocked(assignApplicationToAppUser).mockResolvedValue(undefined);
    render(<AssignApplicationForm />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Asignar" }));

    expect(
      await screen.findByText("Aplicación asignada correctamente."),
    ).toBeInTheDocument();
    expect(assignApplicationToAppUser).toHaveBeenCalledWith("3", {
      applicationId: 2,
    });
    expect(screen.getByLabelText("Usuario de aplicación")).toHaveValue("");
  });

  it("shows the error when the assignment fails", async () => {
    vi.mocked(assignApplicationToAppUser).mockRejectedValue(
      new Error("Already assigned"),
    );
    render(<AssignApplicationForm />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Asignar" }));

    expect(await screen.findByText("Already assigned")).toBeInTheDocument();
    expect(
      screen.queryByText("Aplicación asignada correctamente."),
    ).not.toBeInTheDocument();
  });
});
