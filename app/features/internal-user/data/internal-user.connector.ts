import type {
	AssignApplicationToInternalUserPayload,
	AssignRoleToInternalUserPayload,
	CreateConnectionPayload,
	CreateInternalUserPayload,
} from '@/app/features/internal-user/data/internal-user.dto';
import { requestJson } from '@/app/lib/request-json';

function postJson(url: string, payload: unknown): Promise<unknown> {
	return requestJson(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
}

export function fetchInternalUsers(signal?: AbortSignal): Promise<unknown> {
	return requestJson('/api/internal-users', { signal });
}

export function fetchAssignedApplicationsForInternalUser(
	internalUserId: number | string,
	signal?: AbortSignal,
): Promise<unknown> {
	return requestJson(`/api/internal-users/${internalUserId}/applications`, { signal });
}

export function fetchConnectionsForInternalUser(
	internalUserId: number | string,
	signal?: AbortSignal,
): Promise<unknown> {
	return requestJson(`/api/internal-users/${internalUserId}/connections`, { signal });
}

export function postConnectionForInternalUser(
	internalUserId: number | string,
	payload: CreateConnectionPayload,
): Promise<unknown> {
	return postJson(`/api/internal-users/${internalUserId}/connections`, payload);
}

export function postInternalUser(payload: CreateInternalUserPayload): Promise<unknown> {
	return postJson('/api/internal-users', payload);
}

export function postAssignApplicationToInternalUser(
	internalUserId: number | string,
	payload: AssignApplicationToInternalUserPayload,
): Promise<unknown> {
	return postJson(`/api/internal-users/${internalUserId}/applications`, payload);
}

export function postAssignRoleToInternalUser(
	internalUserId: number | string,
	payload: AssignRoleToInternalUserPayload,
): Promise<unknown> {
	return postJson(`/api/internal-users/${internalUserId}/roles`, payload);
}
