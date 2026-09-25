"use client";

import { useEffect, useState, type FormEvent } from "react";

interface Application {
  id: number;
  name: string;
  description: string;
}

interface ApplicationsResponse {
  data?: Application[];
  message?: string;
}

interface CreateRoleResponse {
  data?: { id: number; applicationId: number; name: string; description: string };
  message?: string;
}

export function CreateRoleForm() {
  const [applications, setApplications] = useState<Application[] | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  const [applicationId, setApplicationId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadApplications() {
      try {
        const response = await fetch("/api/applications");
        const data = (await response
          .json()
          .catch(() => null)) as ApplicationsResponse | null;

        if (cancelled) return;

        if (!response.ok) {
          setLoadError(
            data?.message ?? "No se pudieron obtener las aplicaciones.",
          );
          return;
        }

        const loaded = data?.data ?? [];
        setApplications(loaded);
        if (loaded.length > 0) {
          setApplicationId(String(loaded[0].id));
        }
      } catch {
        if (!cancelled) {
          setLoadError("No se pudo conectar con el servidor.");
        }
      }
    }

    loadApplications();
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
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: Number(applicationId),
          name,
          description,
        }),
      });

      const data = (await response
        .json()
        .catch(() => null)) as CreateRoleResponse | null;

      if (!response.ok) {
        setError(data?.message ?? "No se pudo crear el rol.");
        return;
      }

      setSuccess(`Rol "${data?.data?.name ?? name}" creado correctamente.`);
      setName("");
      setDescription("");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-xl font-semibold text-black dark:text-zinc-50">
        Crear rol de aplicación
      </h2>

      {loadError && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {loadError}
        </p>
      )}

      {!loadError && applications === null && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Cargando…</p>
      )}

      {!loadError && applications !== null && applications.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No hay aplicaciones creadas todavía. Creá una aplicación antes de
          asignarle un rol.
        </p>
      )}

      {!loadError && applications !== null && applications.length > 0 && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="roleName"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Nombre
            </label>
            <input
              id="roleName"
              name="roleName"
              type="text"
              required
              maxLength={20}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded border border-black/[.15] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.2] dark:bg-black dark:text-zinc-50"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Máximo 20 caracteres.
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="roleDescription"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Descripción
            </label>
            <textarea
              id="roleDescription"
              name="roleDescription"
              required
              maxLength={200}
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded border border-black/[.15] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.2] dark:bg-black dark:text-zinc-50"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Máximo 200 caracteres.
            </p>
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
            {isSubmitting ? "Creando…" : "Crear"}
          </button>
        </form>
      )}
    </div>
  );
}
