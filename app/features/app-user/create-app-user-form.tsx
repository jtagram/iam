"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Button, Form } from "react-bootstrap";
import { createAppUser } from "@/app/features/app-user/app-user.service";
import type { CreatedAppUser } from "@/app/features/app-user/app-user.dto";

interface CreateAppUserFormValues {
  name: string;
  description: string;
}

export function CreateAppUserForm() {
  const [created, setCreated] = useState<CreatedAppUser | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateAppUserFormValues>({
    mode: "onChange",
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    clearErrors("root");
    setCreated(null);

    try {
      const createdAppUser = await createAppUser(data);
      setCreated(createdAppUser);
      reset();
    } catch (err) {
      setError("root", { message: (err as Error).message });
    }
  });

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 className="h4 mb-4">Crear usuario de aplicación</h2>

      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="createAppUserName">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            {...register("name", {
              required: "Este campo es obligatorio.",
              maxLength: { value: 20, message: "Máximo 20 caracteres." },
            })}
          />
          {errors.name ? (
            <Form.Text className="text-danger">
              {errors.name.message}
            </Form.Text>
          ) : (
            <Form.Text className="text-muted">
              Máximo 20 caracteres.
            </Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-4" controlId="createAppUserDescription">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            {...register("description", {
              required: "Este campo es obligatorio.",
              maxLength: { value: 200, message: "Máximo 200 caracteres." },
            })}
          />
          {errors.description ? (
            <Form.Text className="text-danger">
              {errors.description.message}
            </Form.Text>
          ) : (
            <Form.Text className="text-muted">
              Máximo 200 caracteres.
            </Form.Text>
          )}
        </Form.Group>

        {errors.root && <Alert variant="danger">{errors.root.message}</Alert>}

        <Button type="submit" variant="dark" disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Creando…" : "Crear"}
        </Button>
      </Form>

      {created && (
        <Alert variant="warning" className="mt-4">
          <p className="mb-3">
            Usuario &quot;{created.name}&quot; creado. Guardá el
            clienteSecret ahora — no se puede volver a obtener.
          </p>

          <Form.Group className="mb-2">
            <Form.Label className="small mb-1">clienteId</Form.Label>
            <Form.Control type="text" readOnly value={created.clienteId} />
          </Form.Group>

          <Form.Group>
            <Form.Label className="small mb-1">clienteSecret</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={created.clienteSecret}
            />
          </Form.Group>
        </Alert>
      )}
    </div>
  );
}
