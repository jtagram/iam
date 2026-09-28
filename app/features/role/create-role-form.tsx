"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Button, Form } from "react-bootstrap";
import { getApplications } from "@/app/features/application/application.service";
import type { Application } from "@/app/features/application/application.dto";
import { createRole } from "@/app/features/role/role.service";

interface CreateRoleFormValues {
  applicationId: string;
  name: string;
  description: string;
}

export function CreateRoleForm() {
  const [applications, setApplications] = useState<Application[] | null>(
    null,
  );
  const [applicationsError, setApplicationsError] = useState<string | null>(
    null,
  );
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateRoleFormValues>({
    mode: "onChange",
    defaultValues: { applicationId: "", name: "", description: "" },
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadApplications() {
      try {
        const loaded = await getApplications(controller.signal);
        setApplications(loaded);
      } catch (err) {
        if (controller.signal.aborted) return;
        setApplicationsError((err as Error).message);
      }
    }

    loadApplications();
    return () => controller.abort();
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    clearErrors("root");
    setSuccess(null);

    try {
      const created = await createRole({
        applicationId: Number(data.applicationId),
        name: data.name,
        description: data.description,
      });

      setSuccess(`Rol "${created?.name ?? data.name}" creado correctamente.`);
      reset();
    } catch (err) {
      setError("root", { message: (err as Error).message });
    }
  });

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 className="h4 mb-4">Crear rol de aplicación</h2>

      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="createRoleApplicationId">
          <Form.Label>Aplicación</Form.Label>
          <Form.Select {...register("applicationId", { required: true })}>
            <option value="" disabled>
              Seleccionar
            </option>
            {applications?.map((application) => (
              <option key={application.id} value={application.id}>
                {application.name}
              </option>
            ))}
          </Form.Select>
          {applicationsError && (
            <Alert variant="danger" className="mt-2">
              {applicationsError}
            </Alert>
          )}
          {!applicationsError && applications === null && (
            <Form.Text className="text-muted">Cargando…</Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="createRoleName">
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

        <Form.Group className="mb-4" controlId="createRoleDescription">
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

        <Button type="submit" variant="dark" disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Creando…" : "Crear"}
        </Button>
      </Form>
    </div>
  );
}
