"use client";

import { useEffect, useState } from "react";
import { getApplications } from "@/app/features/application/application.service";
import type { Application } from "@/app/features/application/application.dto";

export function ApplicationsList() {
  const [applications, setApplications] = useState<Application[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApplications() {
      try {
        const loaded = await getApplications(controller.signal);
        setApplications(loaded);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError((err as Error).message);
      }
    }

    loadApplications();
    return () => controller.abort();
  }, []);

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-xl font-semibold text-black dark:text-zinc-50">
        Ver aplicaciones
      </h2>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {!error && applications === null && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Cargando…
        </p>
      )}

      {!error && applications !== null && applications.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No hay aplicaciones creadas todavía.
        </p>
      )}

      {!error && applications !== null && applications.length > 0 && (
        <ul className="flex flex-col gap-3">
          {applications.map((application) => (
            <li
              key={application.id}
              className="rounded border border-black/[.08] p-4 dark:border-white/[.145]"
            >
              <p className="font-medium text-black dark:text-zinc-50">
                {application.name}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {application.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
