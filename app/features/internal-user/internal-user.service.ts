import {
  fetchAssignedApplicationsForInternalUser,
  fetchInternalUsers,
  postAssignApplicationToInternalUser,
  postAssignRoleToInternalUser,
  postInternalUser,
} from "@/app/features/internal-user/internal-user.connector";
import type {
  AssignApplicationToInternalUserPayload,
  AssignedApplication,
  AssignResult,
  AssignRoleToInternalUserPayload,
  CreateInternalUserPayload,
  CreateInternalUserResult,
  CreatedInternalUser,
  ErrorResponse,
  FetchAssignedApplicationsResult,
  FetchInternalUsersResult,
  InternalUser,
} from "@/app/features/internal-user/internal-user.dto";

export async function getInternalUsers(
  signal?: AbortSignal,
): Promise<InternalUser[]> {
  let result: FetchInternalUsersResult;
  try {
    result = await fetchInternalUsers(signal);
  } catch (err) {
    if (signal?.aborted) {
      throw err;
    }
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok) {
    throw new Error(
      (result.data as ErrorResponse | null)?.message ??
        "No se pudieron obtener los usuarios internos.",
    );
  }

  return (result.data as InternalUser[]) ?? [];
}

export async function getAssignedApplicationsForInternalUser(
  internalUserId: number | string,
  signal?: AbortSignal,
): Promise<AssignedApplication[]> {
  let result: FetchAssignedApplicationsResult;
  try {
    result = await fetchAssignedApplicationsForInternalUser(
      internalUserId,
      signal,
    );
  } catch (err) {
    if (signal?.aborted) {
      throw err;
    }
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok) {
    throw new Error(
      (result.data as ErrorResponse | null)?.message ??
        "No se pudieron obtener las aplicaciones asignadas.",
    );
  }

  return (result.data as AssignedApplication[]) ?? [];
}

export async function createInternalUser(
  payload: CreateInternalUserPayload,
): Promise<Partial<CreatedInternalUser>> {
  let result: CreateInternalUserResult;
  try {
    result = await postInternalUser(payload);
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok) {
    throw new Error(
      result.data?.message ?? "No se pudo crear el usuario interno.",
    );
  }

  return result.data ?? {};
}

export async function assignApplicationToInternalUser(
  internalUserId: number | string,
  payload: AssignApplicationToInternalUserPayload,
): Promise<void> {
  let result: AssignResult;
  try {
    result = await postAssignApplicationToInternalUser(
      internalUserId,
      payload,
    );
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok) {
    throw new Error(result.data?.message ?? "No se pudo asignar la aplicación.");
  }
}

export async function assignRoleToInternalUser(
  internalUserId: number | string,
  payload: AssignRoleToInternalUserPayload,
): Promise<void> {
  let result: AssignResult;
  try {
    result = await postAssignRoleToInternalUser(internalUserId, payload);
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok) {
    throw new Error(result.data?.message ?? "No se pudo asignar el rol.");
  }
}
