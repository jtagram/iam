"use client";

import { useEffect, useState, type FormEvent } from "react";

interface AppUser {
  id: number;
  clienteId: string;
  name: string;
  description: string;
}

interface Application {
  id: number;
  name: string;
  description: string;
}

interface AppUsersResponse {
  data?: AppUser[];
  message?: string;
}

interface ApplicationsResponse {
  data?: Application[];
  message?: string;
}

interface AssignApplicationResponse {
  message?: string;
}

export function AssignApplicationForm() {
  const [appUsers, setAppUsers] = useState<AppUser[] | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  const [appUserId, setAppUserId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const [appUsersResponse, applicationsResponse] = await Promise.all([
          fetch("/api/apps-users"),
          fetch("/api/applications"),
        ]);

        const appUsersData = (await appUsersResponse
          .json()
          .catch(() => null)) as AppUsersResponse | null;
        const applicationsData = (await applicationsResponse
          .json()
          .catch(() => null)) as ApplicationsResponse | null;

        if (cancelled) return;

        if (!appUsersResponse.ok) {
          setLoadError(
            appUsersData?.message ??
              "No se pudieron obtener los usuarios de aplicación.",
          );
          return;
        }

        if (!applicationsResponse.ok) {
          setLoadError(
            applicationsData?.message ??
              "No se pudieron obtener las aplicaciones.",
          );
          return;
        }

        const loadedAppUsers = appUsersData?.data ?? [];
        const loadedApplications = applicationsData?.data ?? [];

        setAppUsers(loadedAppUsers);
        setApplications(loadedApplications);

        if (loadedAppUsers.length > 0) {
          setAppUserId(String(loadedAppUsers[0].id));
        }
        if (loadedApplications.length > 0) {
          setApplicationId(String(loadedApplications[0].id));
        }
      } catch {
        if (!cancelled) {
          setLoadError("No se pudo conectar con el servidor.");
        }
      }
    }

    loadOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/apps-users/${appUserId}/applications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: Number(applicationId) }),
        },
      );

      const data = (await response
        .json()
        .catch(() => null)) as AssignApplicationResponse | null;

      if (!response.ok) {
        setError(data?.message ?? "No se pudo asignar la aplicación.");
        return;
      }

      setSuccess("Aplicación asignada correctamente.");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasOptions =
    appUsers !== null &&
    applications !== null &&
    appUsers.length > 0 &&
    applications.length > 0;

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-xl font-semibold text-black dark:text-zinc-50">
        Asignar aplicación a usuario de aplicación
      </h2>

      {loadError && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {loadError}
        </p>
      )}

      {!loadError && (appUsers === null || applications === null) && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando…</p>
      )}

      {!loadError &&
        appUsers !== null &&
        applications !== null &&
        !hasOptions && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Necesitás al menos un usuario de aplicación y una aplicación
            creados antes de poder asignar.
          </p>
        )}

      {!loadError && hasOptions && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="appUserId"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Usuario de aplicación
            </label>
            <select
              id="appUserId"
              name="appUserId"
              required
              value={appUserId}
              onChange={(event) => setAppUserId(event.target.value)}
              className="w-full rounded border border-black/[.15] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.2] dark:bg-black dark:text-zinc-50"
            >
              {appUsers!.map((appUser) => (
                <option key={appUser.id} value={appUser.id}>
                  {appUser.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label
              htmlFor="applicationId"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Aplicación
            </label>
            <select
              id="applicationId"
              name="applicationId"
              required
              value={applicationId}
              onChange={(event) => setApplicationId(event.target.value)}
              className="w-full rounded border border-black/[.15] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.2] dark:bg-black dark:text-zinc-50"
            >
              {applications!.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p
              className="mb-4 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              className="mb-4 text-sm text-green-600 dark:text-green-400"
              role="status"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-foreground px-5 py-2.5 text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
          >
            {isSubmitting ? "Asignando…" : "Asignar"}
          </button>
        </form>
      )}
    </div>
  );
}
