import {
  fetchRolesByApplication,
  postRole,
} from "@/app/features/role/role.connector";
import type {
  CreateRolePayload,
  CreateRoleResult,
  FetchRolesResult,
  Role,
} from "@/app/features/role/role.dto";

export async function getRolesByApplication(
  applicationId: number | string,
  signal?: AbortSignal,
): Promise<Role[]> {
  let result: FetchRolesResult;
  try {
    result = await fetchRolesByApplication(applicationId, signal);
  } catch (err) {
    if (signal?.aborted) {
      throw err;
    }
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok) {
    throw new Error(result.data?.message ?? "No se pudieron obtener los roles.");
  }

  return result.data?.data ?? [];
}

export async function createRole(
  payload: CreateRolePayload,
): Promise<Role | null> {
  let result: CreateRoleResult;
  try {
    result = await postRole(payload);
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  if (!result.ok) {
    throw new Error(result.data?.message ?? "No se pudo crear el rol.");
  }

  return result.data?.data ?? null;
}
