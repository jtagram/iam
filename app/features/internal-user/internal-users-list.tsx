"use client";

import { useEffect, useState } from "react";
import {
  getAssignedApplicationsForInternalUser,
  getInternalUsers,
} from "@/app/features/internal-user/internal-user.service";
import type {
  AssignedApplication,
  InternalUser,
} from "@/app/features/internal-user/internal-user.dto";

interface InternalUserRow {
  internalUser: InternalUser;
  assignedApplications: AssignedApplication[];
}

export function InternalUsersList() {
  const [rows, setRows] = useState<InternalUserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadInternalUsers() {
      try {
        const internalUsers = await getInternalUsers(controller.signal);

        const loadedRows = await Promise.all(
          internalUsers.map(async (internalUser) => ({
            internalUser,
            assignedApplications: await getAssignedApplicationsForInternalUser(
              internalUser.id,
              controller.signal,
            ),
          })),
        );

        setRows(loadedRows);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError((err as Error).message);
      }
    }

    loadInternalUsers();
    return () => controller.abort();
  }, []);

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-xl font-semibold text-black dark:text-zinc-50">
        Ver usuarios internos
      </h2>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {!error && rows === null && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando…</p>
      )}

      {!error && rows !== null && rows.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No hay usuarios internos creados todavía.
        </p>
      )}

      {!error && rows !== null && rows.length > 0 && (
        <ul className="flex flex-col gap-4">
          {rows.map(({ internalUser, assignedApplications }) => (
            <li
              key={internalUser.id}
              className="rounded border border-black/[.08] p-4 dark:border-white/[.145]"
            >
              <p className="font-medium text-black dark:text-zinc-50">
                {internalUser.name} {internalUser.lastname}
              </p>
              <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                {internalUser.email}
              </p>

              {assignedApplications.length === 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Sin aplicaciones asignadas.
                </p>
              )}

              {assignedApplications.length > 0 && (
                <div className="flex flex-col gap-2">
                  {assignedApplications.map((application) => (
                    <input
                      key={application.applicationId}
                      type="text"
                      disabled
                      readOnly
                      value={`${application.applicationName}:${application.roles
                        .map((role) => role.name)
                        .join(",")}`}
                      className="w-full rounded border border-black/[.15] bg-zinc-100 px-3 py-2 text-black disabled:opacity-100 dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50"
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
