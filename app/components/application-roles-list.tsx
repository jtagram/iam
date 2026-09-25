"use client";

import { useEffect, useState } from "react";

interface Application {
  id: number;
  name: string;
  description: string;
}

interface Role {
  id: number;
  applicationId: number;
  name: string;
  description: string;
}

interface ApplicationsResponse {
  data?: Application[];
  message?: string;
}

interface RolesResponse {
  data?: Role[];
  message?: string;
}

interface ApplicationRolesRow {
  applicationId: number;
  summary: string;
}

export function ApplicationRolesList() {
  const [rows, setRows] = useState<ApplicationRolesRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadApplicationRoles() {
      try {
        const applicationsResponse = await fetch("/api/applications");
        const applicationsData = (await applicationsResponse
          .json()
          .catch(() => null)) as ApplicationsResponse | null;

        if (cancelled) return;

        if (!applicationsResponse.ok) {
          setError(
            applicationsData?.message ??
              "No se pudieron obtener las aplicaciones.",
          );
          return;
        }

        const applications = applicationsData?.data ?? [];

        const rolesByApplication = await Promise.all(
          applications.map(async (application) => {
            const rolesResponse = await fetch(
              `/api/roles?applicationId=${application.id}`,
            );
            const rolesData = (await rolesResponse
              .json()
              .catch(() => null)) as RolesResponse | null;

            if (!rolesResponse.ok) {
              throw new Error(
                rolesData?.message ?? "No se pudieron obtener los roles.",
              );
            }

            const roleNames = (rolesData?.data ?? [])
              .map((role) => role.name)
              .join(",");

            return {
              applicationId: application.id,
              summary: `${application.name}:${roleNames}`,
            };
          }),
        );

        if (!cancelled) {
          setRows(rolesByApplication);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo conectar con el servidor.",
          );
        }
      }
    }

    loadApplicationRoles();
    return () => {
      cancelled = true;
    };
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
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <input
              key={row.applicationId}
              type="text"
              disabled
              readOnly
              value={row.summary}
              className="w-full rounded border border-black/[.15] bg-zinc-100 px-3 py-2 text-black disabled:opacity-100 dark:border-white/[.2] dark:bg-zinc-900 dark:text-zinc-50"
            />
          ))}
        </div>
      )}
    </div>
  );
}
