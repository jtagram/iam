"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getApplications } from "@/app/features/application/application.service";
import type { Application } from "@/app/features/application/application.dto";
import {
  assignApplicationToAppUser,
  getAppUsers,
} from "@/app/features/app-user/app-user.service";
import type { AppUser } from "@/app/features/app-user/app-user.dto";

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
    const controller = new AbortController();

    async function loadOptions() {
      try {
        const [loadedAppUsers, loadedApplications] = await Promise.all([
          getAppUsers(controller.signal),
          getApplications(controller.signal),
        ]);

        setAppUsers(loadedAppUsers);
        setApplications(loadedApplications);
      } catch (err) {
        if (controller.signal.aborted) return;
        setLoadError((err as Error).message);
      }
    }

    loadOptions();
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await assignApplicationToAppUser(appUserId, {
        applicationId: Number(applicationId),
      });

      setSuccess("Aplicación asignada correctamente.");
    } catch (err) {
      setError((err as Error).message);
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
              <option value="" disabled>
                Seleccionar
              </option>
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
              <option value="" disabled>
                Seleccionar
              </option>
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
            disabled={isSubmitting || !appUserId || !applicationId}
            className="rounded-full bg-foreground px-5 py-2.5 text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
          >
            {isSubmitting ? "Asignando…" : "Asignar"}
          </button>
        </form>
      )}
    </div>
  );
}
