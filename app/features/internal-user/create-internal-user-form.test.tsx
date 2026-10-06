import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createInternalUser } from "./internal-user.service";
import { CreateInternalUserForm } from "./create-internal-user-form";

vi.mock("./internal-user.service");

afterEach(() => {
  vi.resetAllMocks();
});

async function fillForm(
  values: Partial<Record<"name" | "lastname" | "email" | "password", string>> = {},
) {
  const { name = "Ana", lastname = "Gil", email = "ana@b.com", password = "secret123" } =
    values;
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nombre"), name);
  await user.type(screen.getByLabelText("Apellido"), lastname);
  await user.type(screen.getByLabelText("Correo electrónico"), email);
  await user.type(screen.getByLabelText("Contraseña"), password);
  return user;
}

describe("CreateInternalUserForm", () => {
  it("disables the submit button until the form is valid", async () => {
    render(<CreateInternalUserForm />);
    const button = screen.getByRole("button", { name: "Crear" });

    expect(button).toBeDisabled();

    await fillForm();

    expect(button).toBeEnabled();
  });

  it("creates the user and shows a success message", async () => {
    vi.mocked(createInternalUser).mockResolvedValue({
      id: 1,
      name: "Ana",
      lastname: "Gil",
      email: "ana@b.com",
    });
    render(<CreateInternalUserForm />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(
      await screen.findByText('Usuario interno "Ana Gil" creado correctamente.'),
    ).toBeInTheDocument();
    expect(createInternalUser).toHaveBeenCalledWith({
      name: "Ana",
      lastname: "Gil",
      email: "ana@b.com",
      password: "secret123",
    });
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
    expect(screen.getByLabelText("Contraseña")).toHaveValue("");
  });

  it("falls back to the typed names when the response has none", async () => {
    vi.mocked(createInternalUser).mockResolvedValue({});
    render(<CreateInternalUserForm />);

    const user = await fillForm({ name: "Typed", lastname: "Name" });
    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(
      await screen.findByText(
        'Usuario interno "Typed Name" creado correctamente.',
      ),
    ).toBeInTheDocument();
  });

  it("shows the error when creation fails", async () => {
    vi.mocked(createInternalUser).mockRejectedValue(new Error("Email taken"));
    render(<CreateInternalUserForm />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(await screen.findByText("Email taken")).toBeInTheDocument();
    expect(screen.queryByText(/creado correctamente/)).not.toBeInTheDocument();
  });

  it("validates the maximum length of name, lastname and email", async () => {
    render(<CreateInternalUserForm />);

    await fillForm({
      name: "x".repeat(16),
      lastname: "y".repeat(16),
      email: "z".repeat(31),
    });

    expect(await screen.findAllByText("Máximo 15 caracteres.")).toHaveLength(2);
    expect(screen.getByText("Máximo 30 caracteres.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear" })).toBeDisabled();
  });

  it("requires a password of at least 8 characters", async () => {
    render(<CreateInternalUserForm />);

    await fillForm({ password: "short" });

    expect(
      await screen.findByText("Debe tener al menos 8 caracteres."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear" })).toBeDisabled();
  });

  it("rejects passwords longer than 72 characters", async () => {
    render(<CreateInternalUserForm />);

    await fillForm({ password: "p".repeat(73) });

    expect(
      await screen.findByText("No puede superar los 72 caracteres."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear" })).toBeDisabled();
  });
});
