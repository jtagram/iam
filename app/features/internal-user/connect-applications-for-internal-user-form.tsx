"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert, Button, Form, Table } from "react-bootstrap";
import {
  createConnectionForInternalUser,
  getAssignedApplicationsForInternalUser,
  getConnectionsForInternalUser,
  getInternalUsers,
} from "@/app/features/internal-user/internal-user.service";
import type {
  ApplicationConnection,
  AssignedApplication,
  InternalUser,
} from "@/app/features/internal-user/internal-user.dto";

interface ConnectApplicationsFormValues {
  internalUserId: string;
  originApplicationId: string;
  destinationApplicationId: string;
}

interface UserScoped<T> {
  internalUserId: string;
  items?: T;
  error?: string;
}

export function ConnectApplicationsForInternalUserForm() {
  const [internalUsers, setInternalUsers] = useState<InternalUser[] | null>(
    null,
  );
  const [internalUsersError, setInternalUsersError] = useState<string | null>(
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
      internalUserId: "",
      originApplicationId: "",
      destinationApplicationId: "",
    },
  });

  const internalUserId = useWatch({ control, name: "internalUserId" });
  const originApplicationId = useWatch({ control, name: "originApplicationId" });
  const destinationApplicationId = useWatch({ control, name: "destinationApplicationId" });

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
    if (!internalUserId) return;
    const controller = new AbortController();

    async function loadAssigned() {
      try {
        const items = await getAssignedApplicationsForInternalUser(
          internalUserId,
          controller.signal,
        );
        setAssigned({ internalUserId, items });
      } catch (err) {
        if (controller.signal.aborted) return;
        setAssigned({ internalUserId, error: (err as Error).message });
      }
    }

    loadAssigned();
    return () => controller.abort();
  }, [internalUserId]);

  useEffect(() => {
    if (!internalUserId) return;
    const controller = new AbortController();

    async function loadConnections() {
      try {
        const items = await getConnectionsForInternalUser(
          internalUserId,
          controller.signal,
        );
        setConnections({ internalUserId, items });
      } catch (err) {
        if (controller.signal.aborted) return;
        setConnections({ internalUserId, error: (err as Error).message });
      }
    }

    loadConnections();
    return () => controller.abort();
  }, [internalUserId, reloadKey]);

  const currentAssigned =
    assigned?.internalUserId === internalUserId ? assigned : null;
  const currentConnections =
    connections?.internalUserId === internalUserId ? connections : null;
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
      await createConnectionForInternalUser(data.internalUserId, {
        originApplicationId: Number(data.originApplicationId),
        destinationApplicationId: Number(data.destinationApplicationId),
      });

      setSuccess("Conexión creada correctamente.");
      setReloadKey((key) => key + 1);
      reset({
        internalUserId: data.internalUserId,
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
    if (!internalUserId) return null;
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
        Relacionar aplicaciones para usuarios internos
      </h2>

      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3" controlId="connectInternalUserId">
          <Form.Label>Usuario interno</Form.Label>
          <Form.Select
            {...register("internalUserId", {
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
            {internalUsers?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} {user.lastname} ({user.email})
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

      {internalUserId && (
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
