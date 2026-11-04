import type {
	AssignApplicationToAppUserPayload,
	AssignRoleToAppUserPayload,
	CreateAppUserPayload,
	CreateConnectionPayload,
} from '@/app/features/app-user/data/app-user.dto';
import { requestJson } from '@/app/lib/request-json';

function postJson(url: string, payload: unknown): Promise<unknown> {
	return requestJson(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
}

export function fetchAppUsers(signal?: AbortSignal): Promise<unknown> {
	return requestJson('/api/apps-users', { signal });
}

export function fetchAssignedApplications(
	appUserId: number | string,
	signal?: AbortSignal,
): Promise<unknown> {
	return requestJson(`/api/apps-users/${appUserId}/applications`, { signal });
}

export function fetchConnectionsForAppUser(
	appUserId: number | string,
	signal?: AbortSignal,
): Promise<unknown> {
	return requestJson(`/api/apps-users/${appUserId}/connections`, { signal });
}

export function postConnectionForAppUser(
	appUserId: number | string,
	payload: CreateConnectionPayload,
): Promise<unknown> {
	return postJson(`/api/apps-users/${appUserId}/connections`, payload);
}

export function postAppUser(payload: CreateAppUserPayload): Promise<unknown> {
	return postJson('/api/apps-users', payload);
}

export function postAssignApplicationToAppUser(
	appUserId: number | string,
	payload: AssignApplicationToAppUserPayload,
): Promise<unknown> {
	return postJson(`/api/apps-users/${appUserId}/applications`, payload);
}

export function postAssignRoleToAppUser(
	appUserId: number | string,
	payload: AssignRoleToAppUserPayload,
): Promise<unknown> {
	return postJson(`/api/apps-users/${appUserId}/roles`, payload);
}
