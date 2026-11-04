import type { ApplicationRoles, Role } from '@/app/features/role/data/role.dto';

/** Checks that a parsed body has the envelope shape; `data` is left unchecked. */
export function isResponseBody(body: unknown): body is { ok: boolean; msg: string; data: unknown } {
	if (typeof body !== 'object' || body === null || Array.isArray(body)) {
		return false;
	}
	const candidate = body as Record<string, unknown>;
	return (
		typeof candidate.ok === 'boolean' && typeof candidate.msg === 'string' && 'data' in candidate
	);
}

export function isRoleResponse(value: unknown): value is Role {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return false;
	}
	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.id === 'number' &&
		typeof candidate.applicationId === 'number' &&
		typeof candidate.name === 'string' &&
		typeof candidate.description === 'string'
	);
}

export function isRoleListResponse(value: unknown): value is Role[] {
	return Array.isArray(value) && value.every(isRoleResponse);
}

function isApplicationRoleItem(value: unknown): boolean {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return false;
	}
	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.id === 'number' &&
		typeof candidate.name === 'string' &&
		typeof candidate.description === 'string'
	);
}

export function isApplicationRolesResponse(value: unknown): value is ApplicationRoles {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return false;
	}
	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.applicationId === 'number' &&
		typeof candidate.applicationName === 'string' &&
		typeof candidate.applicationDescription === 'string' &&
		Array.isArray(candidate.roles) &&
		candidate.roles.every(isApplicationRoleItem)
	);
}

export function isApplicationRolesListResponse(value: unknown): value is ApplicationRoles[] {
	return Array.isArray(value) && value.every(isApplicationRolesResponse);
}
