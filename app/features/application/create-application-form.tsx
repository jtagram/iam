"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Button, Form } from "react-bootstrap";
import { createApplication } from "@/app/features/application/application.service";

interface CreateApplicationFormValues {
  name: string;
  description: string;
}

export function CreateApplicationForm() {
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateApplicationFormValues>({
    mode: "onChange",
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    clearErrors("root");
    setSuccess(null);

    try {
      const created = await createApplication(data);

      setSuccess(
        `Aplicación "${created?.name ?? data.name}" creada correctamente.`,
      );
      reset();
    } catch (err) {
      setError("root", { message: (err as Error).message });
    }
  });

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 className="h4 mb-4">Crear aplicación</h2>

      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="createApplicationName">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            {...register("name", {
              required: "Este campo es obligatorio.",
              maxLength: { value: 15, message: "Máximo 15 caracteres." },
            })}
          />
          {errors.name ? (
            <Form.Text className="text-danger">
              {errors.name.message}
            </Form.Text>
          ) : (
            <Form.Text className="text-muted">
              Máximo 15 caracteres.
            </Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-4" controlId="createApplicationDescription">
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
        {success && <Alert variant="success">{success}</Alert>}

        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Creando…" : "Crear"}
        </Button>
      </Form>
    </div>
  );
}
