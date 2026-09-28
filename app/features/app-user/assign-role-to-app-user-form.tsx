"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert, Button, Form } from "react-bootstrap";
import { getApplications } from "@/app/features/application/application.service";
import type { Application } from "@/app/features/application/application.dto";
import { getRolesByApplication } from "@/app/features/role/role.service";
import type { Role } from "@/app/features/role/role.dto";
import {
  assignRoleToAppUser,
  getAppUsers,
} from "@/app/features/app-user/app-user.service";
import type { AppUser } from "@/app/features/app-user/app-user.dto";

interface AssignRoleToAppUserFormValues {
  appUserId: string;
  applicationId: string;
  roleId: string;
}

export function AssignRoleToAppUserForm() {
  const [appUsers, setAppUsers] = useState<AppUser[] | null>(null);
  const [appUsersError, setAppUsersError] = useState<string | null>(null);

  const [applications, setApplications] = useState<Application[] | null>(
    null,
  );
  const [applicationsError, setApplicationsError] = useState<string | null>(
    null,
  );

  const [roles, setRoles] = useState<Role[] | null>(null);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    resetField,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = useForm<AssignRoleToAppUserFormValues>({
    mode: "onChange",
    defaultValues: { appUserId: "", applicationId: "", roleId: "" },
  });

  const applicationId = useWatch({ control, name: "applicationId" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadAppUsers() {
      try {
        const loaded = await getAppUsers(controller.signal);
        setAppUsers(loaded);
      } catch (err) {
        if (controller.signal.aborted) return;
        setAppUsersError((err as Error).message);
      }
    }

    loadAppUsers();
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

  useEffect(() => {
    if (!applicationId) {
      return;
    }

    const controller = new AbortController();

    async function loadRoles() {
      setRoles(null);
      resetField("roleId");
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
  }, [applicationId, resetField]);

  const onSubmit = handleSubmit(async (data) => {
    clearErrors("root");
    setSuccess(null);

    try {
      await assignRoleToAppUser(data.appUserId, {
        roleId: Number(data.roleId),
      });

      setSuccess("Rol asignado correctamente.");
      reset();
    } catch (err) {
      setError("root", { message: (err as Error).message });
    }
  });

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 className="h4 mb-4">Asignar rol a usuarios de aplicación</h2>

      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="assignRoleAppUserId">
          <Form.Label>Usuario de aplicación</Form.Label>
          <Form.Select {...register("appUserId", { required: true })}>
            <option value="" disabled>
              Seleccionar
            </option>
            {appUsers?.map((appUser) => (
              <option key={appUser.id} value={appUser.id}>
                {appUser.name}
              </option>
            ))}
          </Form.Select>
          {appUsersError && (
            <Alert variant="danger" className="mt-2">
              {appUsersError}
            </Alert>
          )}
          {!appUsersError && appUsers === null && (
            <Form.Text className="text-muted">Cargando…</Form.Text>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="assignRoleApplicationId">
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

        <Form.Group className="mb-4" controlId="assignRoleRoleId">
          <Form.Label>Rol</Form.Label>
          <Form.Select {...register("roleId", { required: true })}>
            <option value="" disabled>
              Seleccionar
            </option>
            {roles?.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Form.Select>
          {rolesError && (
            <Alert variant="danger" className="mt-2">
              {rolesError}
            </Alert>
          )}
          {!rolesError && !applicationId && (
            <Form.Text className="text-muted">
              Seleccioná una aplicación primero.
            </Form.Text>
          )}
          {!rolesError && applicationId && roles === null && (
            <Form.Text className="text-muted">Cargando…</Form.Text>
          )}
        </Form.Group>

        {errors.root && (
          <Alert variant="danger">{errors.root.message}</Alert>
        )}
        {success && <Alert variant="success">{success}</Alert>}

        <Button type="submit" disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Asignando…" : "Asignar"}
        </Button>
      </Form>
    </div>
  );
}
