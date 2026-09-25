"use client";

import { useState, type FormEvent } from "react";

interface CreatedAppUser {
  id: number;
  clienteId: string;
  clienteSecret: string;
  name: string;
  description: string;
}

interface CreateAppUserResponse {
  data?: CreatedAppUser;
  message?: string;
}

export function CreateAppUserForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedAppUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCreated(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/apps-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const data = (await response
        .json()
        .catch(() => null)) as CreateAppUserResponse | null;

      if (!response.ok || !data?.data) {
        setError(
          data?.message ?? "No se pudo crear el usuario de aplicación.",
        );
        return;
      }

      setCreated(data.data);
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
        Crear usuario de aplicación
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="appUserName"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Nombre
          </label>
          <input
            id="appUserName"
            name="appUserName"
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
            htmlFor="appUserDescription"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Descripción
          </label>
          <textarea
            id="appUserDescription"
            name="appUserDescription"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-foreground px-5 py-2.5 text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
        >
          {isSubmitting ? "Creando…" : "Crear"}
        </button>
      </form>

      {created && (
        <div className="mt-6 rounded border border-amber-400 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-950">
          <p className="mb-3 text-sm font-medium text-amber-800 dark:text-amber-200">
            Usuario &quot;{created.name}&quot; creado. Guardá el
            clienteSecret ahora — no se puede volver a obtener.
          </p>

          <div className="mb-2">
            <span className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              clienteId
            </span>
            <input
              type="text"
              disabled
              readOnly
              value={created.clienteId}
              className="w-full rounded border border-black/[.15] bg-white px-3 py-2 text-black disabled:opacity-100 dark:border-white/[.2] dark:bg-black dark:text-zinc-50"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              clienteSecret
            </span>
            <input
              type="text"
              disabled
              readOnly
              value={created.clienteSecret}
              className="w-full rounded border border-black/[.15] bg-white px-3 py-2 text-black disabled:opacity-100 dark:border-white/[.2] dark:bg-black dark:text-zinc-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
