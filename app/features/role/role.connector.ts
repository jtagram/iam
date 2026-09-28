import type {
  CreateRolePayload,
  CreateRoleResult,
  FetchRolesResult,
} from "@/app/features/role/role.dto";

export async function fetchRolesByApplication(
  applicationId: number | string,
  signal?: AbortSignal,
): Promise<FetchRolesResult> {
  const response = await fetch(`/api/roles?applicationId=${applicationId}`, {
    signal,
  });
  const data = (await response
    .json()
    .catch(() => null)) as FetchRolesResult["data"];

  return { ok: response.ok, data };
}

export async function postRole(
  payload: CreateRolePayload,
): Promise<CreateRoleResult> {
  const response = await fetch("/api/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response
    .json()
    .catch(() => null)) as CreateRoleResult["data"];

  return { ok: response.ok, data };
}
