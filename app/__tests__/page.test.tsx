import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "../page";

vi.mock("@/app/components/header", () => ({
  Header: () => <div>stub:header</div>,
}));
vi.mock("@/app/components/home-shell", () => ({
  HomeShell: () => <div>stub:home-shell</div>,
}));

describe("HomePage", () => {
  it("renders the header and the home shell", () => {
    render(<HomePage />);

    expect(screen.getByText("stub:header")).toBeInTheDocument();
    expect(screen.getByText("stub:home-shell")).toBeInTheDocument();
  });
});
