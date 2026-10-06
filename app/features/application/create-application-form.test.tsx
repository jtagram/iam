import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApplication } from "./application.service";
import { CreateApplicationForm } from "./create-application-form";

vi.mock("./application.service");

afterEach(() => {
  vi.resetAllMocks();
});

async function fillForm(name = "billing", description = "Billing app") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nombre"), name);
  await user.type(screen.getByLabelText("Descripción"), description);
  return user;
}

describe("CreateApplicationForm", () => {
  it("disables the submit button until the form is valid", async () => {
    render(<CreateApplicationForm />);
    const button = screen.getByRole("button", { name: "Crear" });

    expect(button).toBeDisabled();

    await fillForm();

    expect(button).toBeEnabled();
  });

  it("creates the application and shows a success message", async () => {
    vi.mocked(createApplication).mockResolvedValue({
      id: 1,
      name: "billing",
      description: "Billing app",
    });
    render(<CreateApplicationForm />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(
      await screen.findByText('Aplicación "billing" creada correctamente.'),
    ).toBeInTheDocument();
    expect(createApplication).toHaveBeenCalledWith({
      name: "billing",
      description: "Billing app",
    });
    expect(screen.getByLabelText("Nombre")).toHaveValue("");
    expect(screen.getByLabelText("Descripción")).toHaveValue("");
  });

  it("falls back to the typed name when the response has no application", async () => {
    vi.mocked(createApplication).mockResolvedValue(null);
    render(<CreateApplicationForm />);

    const user = await fillForm("typed", "desc");
    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(
      await screen.findByText('Aplicación "typed" creada correctamente.'),
    ).toBeInTheDocument();
  });

  it("shows the error when creation fails", async () => {
    vi.mocked(createApplication).mockRejectedValue(new Error("Duplicated"));
    render(<CreateApplicationForm />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(await screen.findByText("Duplicated")).toBeInTheDocument();
    expect(screen.queryByText(/creada correctamente/)).not.toBeInTheDocument();
  });

  it("validates the maximum length of name and description", async () => {
    render(<CreateApplicationForm />);

    await fillForm("x".repeat(16), "y".repeat(201));

    expect(await screen.findByText("Máximo 15 caracteres.")).toHaveClass(
      "text-danger",
    );
    expect(screen.getByText("Máximo 200 caracteres.")).toHaveClass(
      "text-danger",
    );
    expect(screen.getByRole("button", { name: "Crear" })).toBeDisabled();
  });

  it("shows a submitting label while the request is pending", async () => {
    let resolveCreate!: (value: null) => void;
    vi.mocked(createApplication).mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );
    render(<CreateApplicationForm />);

    const user = await fillForm();
    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(screen.getByRole("button", { name: "Creando…" })).toBeDisabled();

    resolveCreate(null);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Crear" })).toBeInTheDocument(),
    );
  });
});
