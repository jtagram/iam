"use client";

import { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
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
        <ListGroup>
          {rows.map(({ internalUser, assignedApplications }) => (
            <ListGroup.Item key={internalUser.id}>
              <div className="fw-medium">
                {internalUser.name} {internalUser.lastname}
              </div>
              <div className="text-muted small mb-2">
                {internalUser.email}
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
