"use client";

import { useEffect, useState, type FormEvent } from "react";

interface InternalUser {
  id: number;
  name: string;
  lastname: string;
  email: string;
}

interface Application {
  id: number;
  name: string;
  description: string;
}

interface ApplicationsResponse {
  data?: Application[];
  message?: string;
}

interface AssignApplicationResponse {
  message?: string;
}

export function AssignApplicationToInternalUserForm() {
  const [internalUsers, setInternalUsers] = useState<InternalUser[] | null>(
    null,
  );
  const [applications, setApplications] = useState<Application[] | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  const [internalUserId, setInternalUserId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const [internalUsersResponse, applicationsResponse] =
          await Promise.all([
            fetch("/api/internal-users"),
            fetch("/api/applications"),
          ]);

        const internalUsersData = (await internalUsersResponse
          .json()
          .catch(() => null)) as InternalUser[] | { message?: string } | null;
        const applicationsData = (await applicationsResponse
          .json()
          .catch(() => null)) as ApplicationsResponse | null;

        if (cancelled) return;

        if (!internalUsersResponse.ok) {
          setLoadError(
            (internalUsersData as { message?: string } | null)?.message ??
              "No se pudieron obtener los usuarios internos.",
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

        const loadedInternalUsers = (internalUsersData as InternalUser[]) ?? [];
        const loadedApplications = applicationsData?.data ?? [];

        setInternalUsers(loadedInternalUsers);
        setApplications(loadedApplications);

        if (loadedInternalUsers.length > 0) {
          setInternalUserId(String(loadedInternalUsers[0].id));
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
        `/api/internal-users/${internalUserId}/applications`,
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
    internalUsers !== null &&
    applications !== null &&
    internalUsers.length > 0 &&
    applications.length > 0;

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-xl font-semibold text-black dark:text-zinc-50">
        Asignar aplicación a usuario interno
      </h2>

      {loadError && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {loadError}
        </p>
      )}

      {!loadError && (internalUsers === null || applications === null) && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando…</p>
      )}

      {!loadError &&
        internalUsers !== null &&
        applications !== null &&
        !hasOptions && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Necesitás al menos un usuario interno y una aplicación creados
            antes de poder asignar.
          </p>
        )}

      {!loadError && hasOptions && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="internalUserIdSelect"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Usuario interno
            </label>
            <select
              id="internalUserIdSelect"
              name="internalUserIdSelect"
              required
              value={internalUserId}
              onChange={(event) => setInternalUserId(event.target.value)}
              className="w-full rounded border border-black/[.15] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.2] dark:bg-black dark:text-zinc-50"
            >
              {internalUsers!.map((internalUser) => (
                <option key={internalUser.id} value={internalUser.id}>
                  {internalUser.name} {internalUser.lastname}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label
              htmlFor="applicationIdSelect"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Aplicación
            </label>
            <select
              id="applicationIdSelect"
              name="applicationIdSelect"
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
