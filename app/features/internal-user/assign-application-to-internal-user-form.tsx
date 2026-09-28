"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Button, Form } from "react-bootstrap";
import { getApplications } from "@/app/features/application/application.service";
import type { Application } from "@/app/features/application/application.dto";
import {
  assignApplicationToInternalUser,
  getInternalUsers,
} from "@/app/features/internal-user/internal-user.service";
import type { InternalUser } from "@/app/features/internal-user/internal-user.dto";

interface AssignApplicationToInternalUserFormValues {
  internalUserId: string;
  applicationId: string;
}

export function AssignApplicationToInternalUserForm() {
  const [internalUsers, setInternalUsers] = useState<InternalUser[] | null>(
    null,
  );
  const [internalUsersError, setInternalUsersError] = useState<string | null>(
    null,
  );

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
  } = useForm<AssignApplicationToInternalUserFormValues>({
    mode: "onChange",
    defaultValues: { internalUserId: "", applicationId: "" },
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadInternalUsers() {
      try {
        const loaded = await getInternalUsers(controller.signal);
        setInternalUsers(loaded);
      } catch (err) {
        if (controller.signal.aborted) return;
        setInternalUsersError((err as Error).message);
      }
    }

    loadInternalUsers();
    return () => controller.abort();
  }, []);

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
      await assignApplicationToInternalUser(data.internalUserId, {
        applicationId: Number(data.applicationId),
      });

      setSuccess("Aplicación asignada correctamente.");
      reset();
    } catch (err) {
      setError("root", { message: (err as Error).message });
    }
  });

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 className="h4 mb-4">Asignar aplicación a usuario interno</h2>

      <Form onSubmit={onSubmit}>
        <Form.Group
          className="mb-3"
          controlId="assignApplicationInternalUserId"
        >
          <Form.Label>Usuario interno</Form.Label>
          <Form.Select {...register("internalUserId", { required: true })}>
            <option value="" disabled>
              Seleccionar
            </option>
            {internalUsers?.map((internalUser) => (
              <option key={internalUser.id} value={internalUser.id}>
                {internalUser.name} {internalUser.lastname}
              </option>
            ))}
          </Form.Select>
          {internalUsersError && (
            <Alert variant="danger" className="mt-2">
              {internalUsersError}
            </Alert>
          )}
          {!internalUsersError && internalUsers === null && (
            <Form.Text className="text-muted">Cargando…</Form.Text>
          )}
        </Form.Group>

        <Form.Group
          className="mb-4"
          controlId="assignApplicationToInternalUserApplicationId"
        >
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

        {errors.root && <Alert variant="danger">{errors.root.message}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Asignando…" : "Asignar"}
        </Button>
      </Form>
    </div>
  );
}
