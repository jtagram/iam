"use client";

import { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { getApplications } from "@/app/features/application/application.service";
import { getRolesByApplication } from "@/app/features/role/role.service";

interface ApplicationRolesRow {
  applicationId: number;
  summary: string;
}

export function ApplicationRolesList() {
  const [rows, setRows] = useState<ApplicationRolesRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApplicationRoles() {
      try {
        const applications = await getApplications(controller.signal);

        const rolesByApplication = await Promise.all(
          applications.map(async (application) => {
            const roles = await getRolesByApplication(
              application.id,
              controller.signal,
            );
            const roleNames = roles.map((role) => role.name).join(",");

            return {
              applicationId: application.id,
              summary: `${application.name}:${roleNames}`,
            };
          }),
        );

        setRows(rolesByApplication);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError((err as Error).message);
      }
    }

    loadApplicationRoles();
    return () => controller.abort();
  }, []);

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-xl font-semibold text-black dark:text-zinc-50">
        Ver roles de aplicaciones
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
          No hay aplicaciones creadas todavía.
        </p>
      )}

      {!error && rows !== null && rows.length > 0 && (
        <ListGroup>
          {rows.map((row) => (
            <ListGroup.Item key={row.applicationId}>
              {row.summary}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
