import type {
  AssignApplicationToInternalUserPayload,
  AssignResult,
  AssignRoleToInternalUserPayload,
  CreateConnectionPayload,
  CreateConnectionResult,
  CreateInternalUserPayload,
  CreateInternalUserResult,
  FetchAssignedApplicationsResult,
  FetchConnectionsResult,
  FetchInternalUsersResult,
} from "@/app/features/internal-user/internal-user.dto";

async function fetchList<T extends { ok: boolean; data: unknown }>(
  url: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, { signal });
  const data = await response.json().catch(() => null);

  return { ok: response.ok, data } as T;
}

export function fetchInternalUsers(
  signal?: AbortSignal,
): Promise<FetchInternalUsersResult> {
  return fetchList<FetchInternalUsersResult>("/api/internal-users", signal);
}

export function fetchAssignedApplicationsForInternalUser(
  internalUserId: number | string,
  signal?: AbortSignal,
): Promise<FetchAssignedApplicationsResult> {
  return fetchList<FetchAssignedApplicationsResult>(
    `/api/internal-users/${internalUserId}/applications`,
    signal,
  );
}

export function fetchConnectionsForInternalUser(
  internalUserId: number | string,
  signal?: AbortSignal,
): Promise<FetchConnectionsResult> {
  return fetchList<FetchConnectionsResult>(
    `/api/internal-users/${internalUserId}/connections`,
    signal,
  );
}

export async function postConnectionForInternalUser(
  internalUserId: number | string,
  payload: CreateConnectionPayload,
): Promise<CreateConnectionResult> {
  const response = await fetch(
    `/api/internal-users/${internalUserId}/connections`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const data = (await response
    .json()
    .catch(() => null)) as CreateConnectionResult["data"];

  return { ok: response.ok, data };
}

export async function postInternalUser(
  payload: CreateInternalUserPayload,
): Promise<CreateInternalUserResult> {
  const response = await fetch("/api/internal-users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response
    .json()
    .catch(() => null)) as CreateInternalUserResult["data"];

  return { ok: response.ok, data };
}

export async function postAssignApplicationToInternalUser(
  internalUserId: number | string,
  payload: AssignApplicationToInternalUserPayload,
): Promise<AssignResult> {
  const response = await fetch(
    `/api/internal-users/${internalUserId}/applications`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const data = (await response.json().catch(() => null)) as AssignResult["data"];

  return { ok: response.ok, data };
}

export async function postAssignRoleToInternalUser(
  internalUserId: number | string,
  payload: AssignRoleToInternalUserPayload,
): Promise<AssignResult> {
  const response = await fetch(`/api/internal-users/${internalUserId}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as AssignResult["data"];

  return { ok: response.ok, data };
}
