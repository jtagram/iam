"use client";

import { useState, type FormEvent } from "react";

interface CreatedInternalUser {
  id: number;
  name: string;
  lastname: string;
  email: string;
}

interface CreateInternalUserResponse extends Partial<CreatedInternalUser> {
  message?: string;
}

export function CreateInternalUserForm() {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/internal-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, lastname, email, password }),
      });

      const data = (await response
        .json()
        .catch(() => null)) as CreateInternalUserResponse | null;

      if (!response.ok) {
        setError(data?.message ?? "No se pudo crear el usuario interno.");
        return;
      }

      setSuccess(
        `Usuario interno "${data?.name ?? name} ${
          data?.lastname ?? lastname
        }" creado correctamente.`,
      );
      setName("");
      setLastname("");
      setEmail("");
      setPassword("");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-xl font-semibold text-black dark:text-zinc-50">
        Crear usuario interno
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="internalUserName"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Nombre
          </label>
          <input
            id="internalUserName"
            name="internalUserName"
            type="text"
            required
            maxLength={15}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded border border-black/[.15] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.2] dark:bg-black dark:text-zinc-50"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="internalUserLastname"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Apellido
          </label>
          <input
            id="internalUserLastname"
            name="internalUserLastname"
            type="text"
            required
            maxLength={15}
            value={lastname}
            onChange={(event) => setLastname(event.target.value)}
            className="w-full rounded border border-black/[.15] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.2] dark:bg-black dark:text-zinc-50"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="internalUserEmail"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Correo electrónico
          </label>
          <input
            id="internalUserEmail"
            name="internalUserEmail"
            type="email"
            required
            maxLength={30}
            autoComplete="off"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border border-black/[.15] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.2] dark:bg-black dark:text-zinc-50"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="internalUserPassword"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Contraseña
          </label>
          <input
            id="internalUserPassword"
            name="internalUserPassword"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border border-black/[.15] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/[.2] dark:bg-black dark:text-zinc-50"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Entre 8 y 72 caracteres.
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
    </div>
  );
}
