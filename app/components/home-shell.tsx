"use client";

import { useState } from "react";
import { NAV_ITEMS, type NavItemId } from "@/app/lib/nav-items";
import { CreateApplicationForm } from "@/app/components/create-application-form";
import { ApplicationsList } from "@/app/components/applications-list";
import { CreateRoleForm } from "@/app/components/create-role-form";
import { ApplicationRolesList } from "@/app/components/application-roles-list";
import { CreateAppUserForm } from "@/app/components/create-app-user-form";
import { AssignApplicationForm } from "@/app/components/assign-application-form";
import { AssignRoleToAppUserForm } from "@/app/components/assign-role-to-app-user-form";
import { AppUsersList } from "@/app/components/app-users-list";
import { CreateInternalUserForm } from "@/app/components/create-internal-user-form";
import { AssignApplicationToInternalUserForm } from "@/app/components/assign-application-to-internal-user-form";
import { AssignRoleToInternalUserForm } from "@/app/components/assign-role-to-internal-user-form";
import { InternalUsersList } from "@/app/components/internal-users-list";

export function HomeShell() {
  const [selected, setSelected] = useState<NavItemId>(NAV_ITEMS[0].id);

  return (
    <div className="flex flex-1">
      <aside className="w-64 shrink-0 border-r border-black/[.08] bg-zinc-50 p-4 dark:border-white/[.145] dark:bg-zinc-950">
        <nav>
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(item.id)}
                  aria-current={selected === item.id ? "page" : undefined}
                  className={`w-full rounded px-3 py-2 text-left text-sm font-medium transition-colors ${
                    selected === item.id
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-zinc-700 hover:bg-black/[.05] dark:text-zinc-300 dark:hover:bg-white/[.08]"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
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
