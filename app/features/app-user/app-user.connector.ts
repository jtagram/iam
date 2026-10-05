import type {
  AssignApplicationToAppUserPayload,
  AssignResult,
  AssignRoleToAppUserPayload,
  CreateAppUserPayload,
  CreateAppUserResult,
  CreateConnectionPayload,
  CreateConnectionResult,
  FetchAppUsersResult,
  FetchAssignedApplicationsResult,
  FetchConnectionsResult,
} from "@/app/features/app-user/app-user.dto";

async function fetchList<T extends { ok: boolean; data: unknown }>(
  url: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, { signal });
  const data = await response.json().catch(() => null);

  return { ok: response.ok, data } as T;
}

export function fetchAppUsers(
  signal?: AbortSignal,
): Promise<FetchAppUsersResult> {
  return fetchList<FetchAppUsersResult>("/api/apps-users", signal);
}

export function fetchAssignedApplications(
  appUserId: number | string,
  signal?: AbortSignal,
): Promise<FetchAssignedApplicationsResult> {
  return fetchList<FetchAssignedApplicationsResult>(
    `/api/apps-users/${appUserId}/applications`,
    signal,
  );
}

export function fetchConnectionsForAppUser(
  appUserId: number | string,
  signal?: AbortSignal,
): Promise<FetchConnectionsResult> {
  return fetchList<FetchConnectionsResult>(
    `/api/apps-users/${appUserId}/connections`,
    signal,
  );
}

export async function postConnectionForAppUser(
  appUserId: number | string,
  payload: CreateConnectionPayload,
): Promise<CreateConnectionResult> {
  const response = await fetch(`/api/apps-users/${appUserId}/connections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response
    .json()
    .catch(() => null)) as CreateConnectionResult["data"];

  return { ok: response.ok, data };
}

export async function postAppUser(
  payload: CreateAppUserPayload,
): Promise<CreateAppUserResult> {
  const response = await fetch("/api/apps-users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response
    .json()
    .catch(() => null)) as CreateAppUserResult["data"];

  return { ok: response.ok, data };
}

export async function postAssignApplicationToAppUser(
  appUserId: number | string,
  payload: AssignApplicationToAppUserPayload,
): Promise<AssignResult> {
  const response = await fetch(`/api/apps-users/${appUserId}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as AssignResult["data"];

  return { ok: response.ok, data };
}

export async function postAssignRoleToAppUser(
  appUserId: number | string,
  payload: AssignRoleToAppUserPayload,
): Promise<AssignResult> {
  const response = await fetch(`/api/apps-users/${appUserId}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as AssignResult["data"];

  return { ok: response.ok, data };
}
