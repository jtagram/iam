import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createAppUser } from "../app-user.service";
import { CreateAppUserForm } from "../create-app-user-form";

vi.mock("../app-user.service");

afterEach(() => {
  vi.resetAllMocks();
});

async function fillForm(name = "svc", description = "Service user") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nombre"), name);
  await user.type(screen.getByLabelText("Descripción"), description);
  return user;
}

describe("CreateAppUserForm", () => {
  it("disables the submit button until the form is valid", async () => {
    render(<CreateAppUserForm />);
    const button = screen.getByRole("button", { name: "Crear" });

    expect(button).toBeDisabled();

    await fillForm();

    expect(button).toBeEnabled();
  });

  it("creates the user and reveals the generated credentials", async () => {
    vi.mocked(createAppUser).mockResolvedValue({
      id: 1,
      clienteId: "client-123",
      clienteSecret: "secret-456",
      name: "svc",
      description: "Service user",
    });
    render(<CreateAppUserForm />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(await screen.findByDisplayValue("client-123")).toHaveAttribute("readonly");
    expect(screen.getByDisplayValue("secret-456")).toHaveAttribute("readonly");
    expect(screen.getByText(/Usuario "svc" creado/)).toBeInTheDocument();
    expect(createAppUser).toHaveBeenCalledWith({
      name: "svc",
      description: "Service user",
    });
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
  });

  it("shows the error when creation fails and no credentials", async () => {
    vi.mocked(createAppUser).mockRejectedValue(new Error("Duplicated"));
    render(<CreateAppUserForm />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(await screen.findByText("Duplicated")).toBeInTheDocument();
    expect(screen.queryByText(/clienteSecret ahora/)).not.toBeInTheDocument();
  });

  it("validates the maximum length of name and description", async () => {
    render(<CreateAppUserForm />);

    await fillForm("x".repeat(21), "y".repeat(201));

    expect(await screen.findByText("Máximo 20 caracteres.")).toHaveClass(
      "text-danger",
    );
    expect(screen.getByText("Máximo 200 caracteres.")).toHaveClass(
      "text-danger",
    );
    expect(screen.getByRole("button", { name: "Crear" })).toBeDisabled();
  });
});
