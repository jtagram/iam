import type { CreateRolePayload } from '@/app/features/role/data/role.dto';
import { requestJson } from '@/app/lib/request-json';

export function fetchRolesByApplication(
	applicationId: number | string,
	signal?: AbortSignal,
): Promise<unknown> {
	return requestJson(`/api/roles?applicationId=${applicationId}`, { signal });
}

export function fetchRolesGroupedByApplication(signal?: AbortSignal): Promise<unknown> {
	return requestJson('/api/roles/grouped-by-application', { signal });
}

export function postRole(payload: CreateRolePayload): Promise<unknown> {
	return requestJson('/api/roles', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
}
