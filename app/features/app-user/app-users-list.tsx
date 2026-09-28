"use client";

import { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import {
  getAppUsers,
  getAssignedApplicationsForAppUser,
} from "@/app/features/app-user/app-user.service";
import type {
  AppUser,
  AssignedApplication,
} from "@/app/features/app-user/app-user.dto";

interface AppUserRow {
  appUser: AppUser;
  assignedApplications: AssignedApplication[];
}

export function AppUsersList() {
  const [rows, setRows] = useState<AppUserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAppUsers() {
      try {
        const appUsers = await getAppUsers(controller.signal);

        const loadedRows = await Promise.all(
          appUsers.map(async (appUser) => ({
            appUser,
            assignedApplications: await getAssignedApplicationsForAppUser(
              appUser.id,
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

    loadAppUsers();
    return () => controller.abort();
  }, []);

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-xl font-semibold text-black dark:text-zinc-50">
        Ver usuarios de aplicación
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
          No hay usuarios de aplicación creados todavía.
        </p>
      )}

      {!error && rows !== null && rows.length > 0 && (
        <ListGroup>
          {rows.map(({ appUser, assignedApplications }) => (
            <ListGroup.Item key={appUser.id}>
              <div className="fw-medium">{appUser.name}</div>
              <div className="text-muted small mb-2">
                {appUser.description}
              </div>

              {assignedApplications.length === 0 && (
                <div className="text-muted small">
                  Sin aplicaciones asignadas.
                </div>
              )}

              {assignedApplications.length > 0 && (
                <ListGroup variant="flush">
                  {assignedApplications.map((application) => (
                    <ListGroup.Item
                      key={application.applicationId}
                      className="px-0"
                    >
                      {application.applicationName}:{" "}
                      {application.roles.map((role) => role.name).join(", ")}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
