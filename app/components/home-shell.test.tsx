import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NAV_ITEMS } from "@/app/lib/nav-items";
import { HomeShell } from "./home-shell";

vi.mock("@/app/features/application/create-application-form", () => ({
  CreateApplicationForm: () => <div>stub:create-application</div>,
}));
vi.mock("@/app/features/application/applications-list", () => ({
  ApplicationsList: () => <div>stub:view-applications</div>,
}));
vi.mock("@/app/features/role/create-role-form", () => ({
  CreateRoleForm: () => <div>stub:create-role</div>,
}));
vi.mock("@/app/features/role/application-roles-list", () => ({
  ApplicationRolesList: () => <div>stub:view-application-roles</div>,
}));
vi.mock("@/app/features/app-user/create-app-user-form", () => ({
  CreateAppUserForm: () => <div>stub:create-app-user</div>,
}));
vi.mock("@/app/features/app-user/assign-application-form", () => ({
  AssignApplicationForm: () => <div>stub:assign-application-to-app-user</div>,
}));
vi.mock("@/app/features/app-user/assign-role-to-app-user-form", () => ({
  AssignRoleToAppUserForm: () => <div>stub:assign-role-to-app-user</div>,
}));
vi.mock("@/app/features/app-user/connect-applications-for-app-user-form", () => ({
  ConnectApplicationsForAppUserForm: () => (
    <div>stub:connect-applications-for-app-user</div>
  ),
}));
vi.mock("@/app/features/app-user/app-users-list", () => ({
  AppUsersList: () => <div>stub:view-app-users</div>,
}));
vi.mock("@/app/features/internal-user/create-internal-user-form", () => ({
  CreateInternalUserForm: () => <div>stub:create-internal-user</div>,
}));
vi.mock(
  "@/app/features/internal-user/assign-application-to-internal-user-form",
  () => ({
    AssignApplicationToInternalUserForm: () => (
      <div>stub:assign-application-to-internal-user</div>
    ),
  }),
);
vi.mock("@/app/features/internal-user/assign-role-to-internal-user-form", () => ({
  AssignRoleToInternalUserForm: () => <div>stub:assign-role-to-internal-user</div>,
}));
vi.mock(
  "@/app/features/internal-user/connect-applications-for-internal-user-form",
  () => ({
    ConnectApplicationsForInternalUserForm: () => (
      <div>stub:connect-applications-for-internal-user</div>
    ),
  }),
);
vi.mock("@/app/features/internal-user/internal-users-list", () => ({
  InternalUsersList: () => <div>stub:view-internal-users</div>,
}));

describe("HomeShell", () => {
  it("renders every navigation entry", () => {
    render(<HomeShell />);

    for (const item of NAV_ITEMS) {
      expect(screen.getByRole("button", { name: item.label })).toBeInTheDocument();
    }
  });

  it("shows the first navigation item by default", () => {
    render(<HomeShell />);

    expect(screen.getByText(`stub:${NAV_ITEMS[0].id}`)).toBeInTheDocument();
  });

  it.each(NAV_ITEMS)("shows the matching view when selecting $label", async (item) => {
    render(<HomeShell />);

    await userEvent.setup().click(screen.getByRole("button", { name: item.label }));

    expect(screen.getByText(`stub:${item.id}`)).toBeInTheDocument();
    expect(screen.getAllByText(/^stub:/)).toHaveLength(1);
  });
});
