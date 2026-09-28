"use client";

import { useState } from "react";
import { Nav } from "react-bootstrap";
import { NAV_ITEMS, type NavItemId } from "@/app/lib/nav-items";
import { CreateApplicationForm } from "@/app/features/application/create-application-form";
import { ApplicationsList } from "@/app/features/application/applications-list";
import { CreateRoleForm } from "@/app/features/role/create-role-form";
import { ApplicationRolesList } from "@/app/features/role/application-roles-list";
import { CreateAppUserForm } from "@/app/features/app-user/create-app-user-form";
import { AssignApplicationForm } from "@/app/features/app-user/assign-application-form";
import { AssignRoleToAppUserForm } from "@/app/features/app-user/assign-role-to-app-user-form";
import { AppUsersList } from "@/app/features/app-user/app-users-list";
import { CreateInternalUserForm } from "@/app/features/internal-user/create-internal-user-form";
import { AssignApplicationToInternalUserForm } from "@/app/features/internal-user/assign-application-to-internal-user-form";
import { AssignRoleToInternalUserForm } from "@/app/features/internal-user/assign-role-to-internal-user-form";
import { InternalUsersList } from "@/app/features/internal-user/internal-users-list";

export function HomeShell() {
  const [selected, setSelected] = useState<NavItemId>(NAV_ITEMS[0].id);

  return (
    <div className="d-flex flex-grow-1 overflow-hidden">
      <Nav
        variant="pills"
        activeKey={selected}
        onSelect={(key) => key && setSelected(key as NavItemId)}
        className="flex-column flex-nowrap flex-shrink-0 border-end bg-light p-3"
        style={{ width: 260, overflowY: "auto" }}
      >
        {NAV_ITEMS.map((item) => (
          <Nav.Item key={item.id} className="mb-1">
            <Nav.Link eventKey={item.id}>{item.label}</Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <main
        className="flex-grow-1 overflow-auto p-4"
        style={{ minWidth: 0 }}
      >
        {selected === "create-application" && <CreateApplicationForm />}
        {selected === "view-applications" && <ApplicationsList />}
        {selected === "create-role" && <CreateRoleForm />}
        {selected === "view-application-roles" && <ApplicationRolesList />}
        {selected === "create-app-user" && <CreateAppUserForm />}
        {selected === "assign-application-to-app-user" && (
          <AssignApplicationForm />
        )}
        {selected === "assign-role-to-app-user" && (
          <AssignRoleToAppUserForm />
        )}
        {selected === "view-app-users" && <AppUsersList />}
        {selected === "create-internal-user" && <CreateInternalUserForm />}
        {selected === "assign-application-to-internal-user" && (
          <AssignApplicationToInternalUserForm />
        )}
        {selected === "assign-role-to-internal-user" && (
          <AssignRoleToInternalUserForm />
        )}
        {selected === "view-internal-users" && <InternalUsersList />}
      </main>
    </div>
  );
}
