import {
  fetchAppUsers,
  fetchAssignedApplications,
  postAppUser,
  postAssignApplicationToAppUser,
  postAssignRoleToAppUser,
} from "@/app/features/app-user/app-user.connector";
import type {
  AppUser,
  AssignApplicationToAppUserPayload,
  AssignedApplication,
  AssignResult,
  AssignRoleToAppUserPayload,
  CreateAppUserPayload,
  CreateAppUserResult,
  CreatedAppUser,
  FetchAppUsersResult,
  FetchAssignedApplicationsResult,
} from "@/app/features/app-user/app-user.dto";

export async function getAppUsers(signal?: AbortSignal): Promise<AppUser[]> {
  let result: FetchAppUsersResult;
  try {
    result = await fetchAppUsers(signal);
  } catch (err) {
    if (signal?.aborted) {
      throw err;
    }
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok) {
    throw new Error(
      result.data?.message ?? "No se pudieron obtener los usuarios de aplicación.",
    );
  }

  return result.data?.data ?? [];
}

export async function getAssignedApplicationsForAppUser(
  appUserId: number | string,
  signal?: AbortSignal,
): Promise<AssignedApplication[]> {
  let result: FetchAssignedApplicationsResult;
  try {
    result = await fetchAssignedApplications(appUserId, signal);
  } catch (err) {
    if (signal?.aborted) {
      throw err;
    }
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok) {
    throw new Error(
      result.data?.message ?? "No se pudieron obtener las aplicaciones asignadas.",
    );
  }

  return result.data?.data ?? [];
}

export async function createAppUser(
  payload: CreateAppUserPayload,
): Promise<CreatedAppUser> {
  let result: CreateAppUserResult;
  try {
    result = await postAppUser(payload);
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok || !result.data?.data) {
    throw new Error(
      result.data?.message ?? "No se pudo crear el usuario de aplicación.",
    );
  }

  return result.data.data;
}

export async function assignApplicationToAppUser(
  appUserId: number | string,
  payload: AssignApplicationToAppUserPayload,
): Promise<void> {
  let result: AssignResult;
  try {
    result = await postAssignApplicationToAppUser(appUserId, payload);
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok) {
    throw new Error(result.data?.message ?? "No se pudo asignar la aplicación.");
  }
}

export async function assignRoleToAppUser(
  appUserId: number | string,
  payload: AssignRoleToAppUserPayload,
): Promise<void> {
  let result: AssignResult;
  try {
    result = await postAssignRoleToAppUser(appUserId, payload);
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok) {
    throw new Error(result.data?.message ?? "No se pudo asignar el rol.");
  }
}
