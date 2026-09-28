"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getApplications } from "@/app/features/application/application.service";
import type { Application } from "@/app/features/application/application.dto";
import { getRolesByApplication } from "@/app/features/role/role.service";
import type { Role } from "@/app/features/role/role.dto";
import {
  assignRoleToInternalUser,
  getInternalUsers,
} from "@/app/features/internal-user/internal-user.service";
import type { InternalUser } from "@/app/features/internal-user/internal-user.dto";

export function AssignRoleToInternalUserForm() {
  const [internalUsers, setInternalUsers] = useState<InternalUser[] | null>(
    null,
  );
  const [applications, setApplications] = useState<Application[] | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  const [internalUserId, setInternalUserId] = useState("");
  const [applicationId, setApplicationId] = useState("");

  const [roles, setRoles] = useState<Role[] | null>(null);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [roleId, setRoleId] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOptions() {
      try {
        const [loadedInternalUsers, loadedApplications] = await Promise.all([
          getInternalUsers(controller.signal),
          getApplications(controller.signal),
        ]);

        setInternalUsers(loadedInternalUsers);
        setApplications(loadedApplications);
      } catch (err) {
        if (controller.signal.aborted) return;
        setLoadError((err as Error).message);
      }
    }

    loadOptions();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!applicationId) {
      return;
    }

    const controller = new AbortController();

    async function loadRoles() {
      setRoles(null);
      setRoleId("");
      setRolesError(null);

      try {
        const loaded = await getRolesByApplication(
          applicationId,
          controller.signal,
        );
        setRoles(loaded);
      } catch (err) {
        if (controller.signal.aborted) return;
        setRolesError((err as Error).message);
      }
    }

    loadRoles();
    return () => controller.abort();
  }, [applicationId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await assignRoleToInternalUser(internalUserId, {
        roleId: Number(roleId),
      });

      setSuccess("Rol asignado correctamente.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasBaseOptions =
    internalUsers !== null &&
    applications !== null &&
    internalUsers.length > 0 &&
    applications.length > 0;

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-xl font-semibold text-black dark:text-zinc-50">
        Asignar rol a usuario interno
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
        !hasBaseOptions && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Necesitás al menos un usuario interno y una aplicación creados
            antes de poder asignar un rol.
          </p>
        )}

      {!loadError && hasBaseOptions && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="assignRoleInternalUserId"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Usuario interno
            </label>
            <select
              id="assignRoleInternalUserId"
              name="assignRoleInternalUserId"
              required
              value={internalUserId}
              onChange={(event) => setInternalUserId(event.target.value)}
              className="w-full rounded border border-black/[.15] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.2] dark:bg-black dark:text-zinc-50"
            >
              <option value="" disabled>
                Seleccionar
              </option>
              {internalUsers!.map((internalUser) => (
                <option key={internalUser.id} value={internalUser.id}>
                  {internalUser.name} {internalUser.lastname}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="assignRoleInternalUserApplicationId"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Aplicación
            </label>
            <select
              id="assignRoleInternalUserApplicationId"
              name="assignRoleInternalUserApplicationId"
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

          <div className="mb-6">
            <label
              htmlFor="assignRoleInternalUserRoleId"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Rol
            </label>

            {rolesError && (
              <p
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {rolesError}
              </p>
            )}

            {!rolesError && !applicationId && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Seleccioná una aplicación primero.
              </p>
            )}

            {!rolesError && applicationId && roles === null && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Cargando…
              </p>
            )}

            {!rolesError && roles !== null && roles.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Esta aplicación no tiene roles creados todavía.
              </p>
            )}

            {!rolesError && roles !== null && roles.length > 0 && (
              <select
                id="assignRoleInternalUserRoleId"
                name="assignRoleInternalUserRoleId"
                required
                value={roleId}
                onChange={(event) => setRoleId(event.target.value)}
                className="w-full rounded border border-black/[.15] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.2] dark:bg-black dark:text-zinc-50"
              >
                <option value="" disabled>
                  Seleccionar
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            )}
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
            disabled={
              isSubmitting || !internalUserId || !applicationId || !roleId
            }
            className="rounded-full bg-foreground px-5 py-2.5 text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
          >
            {isSubmitting ? "Asignando…" : "Asignar"}
          </button>
        </form>
      )}
    </div>
  );
}
