"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Button, Form } from "react-bootstrap";
import { createInternalUser } from "@/app/features/internal-user/internal-user.service";

interface CreateInternalUserFormValues {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

export function CreateInternalUserForm() {
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateInternalUserFormValues>({
    mode: "onChange",
    defaultValues: { name: "", lastname: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    clearErrors("root");
    setSuccess(null);

    try {
      const created = await createInternalUser(data);

      setSuccess(
        `Usuario interno "${created.name ?? data.name} ${
          created.lastname ?? data.lastname
        }" creado correctamente.`,
      );
      reset();
    } catch (err) {
      setError("root", { message: (err as Error).message });
    }
  });

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 className="h4 mb-4">Crear usuario interno</h2>

      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="createInternalUserName">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            {...register("name", {
              required: "Este campo es obligatorio.",
              maxLength: { value: 15, message: "Máximo 15 caracteres." },
            })}
          />
          {errors.name && (
            <Form.Text className="text-danger">
              {errors.name.message}
            </Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="createInternalUserLastname">
          <Form.Label>Apellido</Form.Label>
          <Form.Control
            type="text"
            {...register("lastname", {
              required: "Este campo es obligatorio.",
              maxLength: { value: 15, message: "Máximo 15 caracteres." },
            })}
          />
          {errors.lastname && (
            <Form.Text className="text-danger">
              {errors.lastname.message}
            </Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="createInternalUserEmail">
          <Form.Label>Correo electrónico</Form.Label>
          <Form.Control
            type="email"
            autoComplete="off"
            {...register("email", {
              required: "Este campo es obligatorio.",
              maxLength: { value: 30, message: "Máximo 30 caracteres." },
            })}
          />
          {errors.email && (
            <Form.Text className="text-danger">
              {errors.email.message}
            </Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-4" controlId="createInternalUserPassword">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            autoComplete="new-password"
            {...register("password", {
              required: "Este campo es obligatorio.",
              minLength: {
                value: 8,
                message: "Debe tener al menos 8 caracteres.",
              },
              maxLength: {
                value: 72,
                message: "No puede superar los 72 caracteres.",
              },
            })}
          />
          {errors.password ? (
            <Form.Text className="text-danger">
              {errors.password.message}
            </Form.Text>
          ) : (
            <Form.Text className="text-muted">
              Entre 8 y 72 caracteres.
            </Form.Text>
          )}
        </Form.Group>

        {errors.root && <Alert variant="danger">{errors.root.message}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Creando…" : "Crear"}
        </Button>
      </Form>
    </div>
  );
}
