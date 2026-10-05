"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert, Button, Form, Table } from "react-bootstrap";
import {
  createConnectionForAppUser,
  getAssignedApplicationsForAppUser,
  getConnectionsForAppUser,
  getAppUsers,
} from "@/app/features/app-user/app-user.service";
import type {
  ApplicationConnection,
  AssignedApplication,
  AppUser,
} from "@/app/features/app-user/app-user.dto";

interface ConnectApplicationsFormValues {
  appUserId: string;
  originApplicationId: string;
  destinationApplicationId: string;
}

interface UserScoped<T> {
  appUserId: string;
  items?: T;
  error?: string;
}

export function ConnectApplicationsForAppUserForm() {
  const [appUsers, setAppUsers] = useState<AppUser[] | null>(
    null,
  );
  const [appUsersError, setAppUsersError] = useState<string | null>(
    null,
  );
  const [assigned, setAssigned] = useState<
    UserScoped<AssignedApplication[]> | null
  >(null);
  const [connections, setConnections] = useState<
    UserScoped<ApplicationConnection[]> | null
  >(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    control,
    getValues,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ConnectApplicationsFormValues>({
    mode: "onChange",
    defaultValues: {
      appUserId: "",
      originApplicationId: "",
      destinationApplicationId: "",
    },
  });

  const appUserId = useWatch({ control, name: "appUserId" });
  const originApplicationId = useWatch({ control, name: "originApplicationId" });
  const destinationApplicationId = useWatch({ control, name: "destinationApplicationId" });

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
    if (!appUserId) return;
    const controller = new AbortController();

    async function loadAssigned() {
      try {
        const items = await getAssignedApplicationsForAppUser(
          appUserId,
          controller.signal,
        );
        setAssigned({ appUserId, items });
      } catch (err) {
        if (controller.signal.aborted) return;
        setAssigned({ appUserId, error: (err as Error).message });
      }
    }

    loadAssigned();
    return () => controller.abort();
  }, [appUserId]);

  useEffect(() => {
    if (!appUserId) return;
    const controller = new AbortController();

    async function loadConnections() {
      try {
        const items = await getConnectionsForAppUser(
          appUserId,
          controller.signal,
        );
        setConnections({ appUserId, items });
      } catch (err) {
        if (controller.signal.aborted) return;
        setConnections({ appUserId, error: (err as Error).message });
      }
    }

    loadConnections();
    return () => controller.abort();
  }, [appUserId, reloadKey]);

  const currentAssigned =
    assigned?.appUserId === appUserId ? assigned : null;
  const currentConnections =
    connections?.appUserId === appUserId ? connections : null;
  const sameApplication =
    originApplicationId !== "" &&
    originApplicationId === destinationApplicationId;

  const onSubmit = handleSubmit(async (data) => {
    clearErrors("root");
    setSuccess(null);

    if (data.originApplicationId === data.destinationApplicationId) {
      setError("root", {
        message: "La aplicación origen y destino deben ser distintas.",
      });
      return;
    }

    try {
      await createConnectionForAppUser(data.appUserId, {
        originApplicationId: Number(data.originApplicationId),
        destinationApplicationId: Number(data.destinationApplicationId),
      });

      setSuccess("Conexión creada correctamente.");
      setReloadKey((key) => key + 1);
      reset({
        appUserId: data.appUserId,
        originApplicationId: data.originApplicationId,
        destinationApplicationId: "",
      });
    } catch (err) {
      setError("root", { message: (err as Error).message });
    }
  });

  function renderApplicationOptions() {
    return currentAssigned?.items?.map((application) => (
      <option key={application.applicationId} value={application.applicationId}>
        {application.applicationName}
      </option>
    ));
  }

  function renderApplicationStatus() {
    if (!appUserId) return null;
    if (currentAssigned?.error) {
      return (
        <Alert variant="danger" className="mt-2">
          {currentAssigned.error}
        </Alert>
      );
    }
    if (!currentAssigned) {
      return <Form.Text className="text-muted">Cargando…</Form.Text>;
    }
    return null;
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h2 className="h4 mb-4">
        Relacionar aplicaciones para usuarios de aplicacion
      </h2>

      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="connectAppUserId">
          <Form.Label>Usuario de aplicación</Form.Label>
          <Form.Select
            {...register("appUserId", {
              required: true,
              onChange: () => {
                setValue("originApplicationId", "");
                setValue("destinationApplicationId", "");
                setSuccess(null);
              },
            })}
          >
            <option value="" disabled>
              Seleccionar
            </option>
            {appUsers?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
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

        <Form.Group className="mb-3" controlId="connectOriginApplicationId">
          <Form.Label>Aplicación origen</Form.Label>
          <Form.Select
            disabled={!currentAssigned?.items}
            {...register("originApplicationId", {
              required: true,
              deps: ["destinationApplicationId"],
            })}
          >
            <option value="" disabled>
              Seleccionar
            </option>
            {renderApplicationOptions()}
          </Form.Select>
          {renderApplicationStatus()}
        </Form.Group>

        <Form.Group
          className="mb-4"
          controlId="connectDestinationApplicationId"
        >
          <Form.Label>Aplicación destino</Form.Label>
          <Form.Select
            disabled={!currentAssigned?.items}
            {...register("destinationApplicationId", {
              required: true,
              validate: (value) =>
                value !== getValues("originApplicationId") ||
                "La aplicación origen y destino deben ser distintas.",
            })}
          >
            <option value="" disabled>
              Seleccionar
            </option>
            {renderApplicationOptions()}
          </Form.Select>
          {sameApplication && (
            <Form.Text className="text-danger">
              La aplicación origen y destino deben ser distintas.
            </Form.Text>
          )}
        </Form.Group>

        {errors.root && <Alert variant="danger">{errors.root.message}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Button
          type="submit"
          variant="dark"
          disabled={isSubmitting || !isValid || sameApplication}
        >
          {isSubmitting ? "Relacionando…" : "Relacionar"}
        </Button>
      </Form>

      {appUserId && (
        <section className="mt-5">
          <h3 className="h5 mb-3">Conexiones existentes</h3>
          {currentConnections?.error && (
            <Alert variant="danger">{currentConnections.error}</Alert>
          )}
          {!currentConnections && (
            <Form.Text className="text-muted">Cargando…</Form.Text>
          )}
          {currentConnections?.items &&
            (currentConnections.items.length === 0 ? (
              <p className="text-muted">
                Este usuario aún no tiene conexiones.
              </p>
            ) : (
              <Table striped bordered size="sm">
                <thead>
                  <tr>
                    <th>Origen</th>
                    <th>Destino</th>
                  </tr>
                </thead>
                <tbody>
                  {currentConnections.items.map((connection) => (
                    <tr key={connection.id}>
                      <td>{connection.originApplicationName}</td>
                      <td>{connection.destinationApplicationName}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ))}
        </section>
      )}
    </div>
  );
}
