import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getApplications } from "./application.service";
import { ApplicationsList } from "./applications-list";

vi.mock("./application.service");

afterEach(() => {
  vi.resetAllMocks();
});

describe("ApplicationsList", () => {
  it("shows a loading message while fetching", () => {
    vi.mocked(getApplications).mockReturnValue(new Promise(() => {}));
    render(<ApplicationsList />);

    expect(screen.getByText("Cargando…")).toBeInTheDocument();
  });

  it("renders every application with its description", async () => {
    vi.mocked(getApplications).mockResolvedValue([
      { id: 1, name: "billing", description: "Billing app" },
      { id: 2, name: "crm", description: "CRM app" },
    ]);
    render(<ApplicationsList />);

    expect(await screen.findByText("billing")).toBeInTheDocument();
    expect(screen.getByText("Billing app")).toBeInTheDocument();
    expect(screen.getByText("crm")).toBeInTheDocument();
    expect(screen.getByText("CRM app")).toBeInTheDocument();
    expect(screen.queryByText("Cargando…")).not.toBeInTheDocument();
  });

  it("shows an empty message when there are no applications", async () => {
    vi.mocked(getApplications).mockResolvedValue([]);
    render(<ApplicationsList />);

    expect(
      await screen.findByText("No hay aplicaciones creadas todavía."),
    ).toBeInTheDocument();
  });

  it("shows the error message when loading fails", async () => {
    vi.mocked(getApplications).mockRejectedValue(new Error("Forbidden"));
    render(<ApplicationsList />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Forbidden");
    expect(screen.queryByText("Cargando…")).not.toBeInTheDocument();
  });

  it("aborts the request when unmounted", () => {
    vi.mocked(getApplications).mockReturnValue(new Promise(() => {}));
    const { unmount } = render(<ApplicationsList />);

    const signal = vi.mocked(getApplications).mock.calls[0][0] as AbortSignal;
    expect(signal.aborted).toBe(false);

    unmount();

    expect(signal.aborted).toBe(true);
  });
});
