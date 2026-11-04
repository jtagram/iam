import type {
	ApplicationConnection,
	AppUser,
	AssignedApplication,
	AssignedRole,
	CreatedAppUser,
} from '@/app/features/app-user/data/app-user.dto';

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

function asRecord(value: unknown): Record<string, unknown> | null {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return null;
	}
	return value as Record<string, unknown>;
}

export function isAppUserResponse(value: unknown): value is AppUser {
	const candidate = asRecord(value);
	return (
		candidate !== null &&
		typeof candidate.id === 'number' &&
		typeof candidate.clienteId === 'string' &&
		typeof candidate.name === 'string' &&
		typeof candidate.description === 'string'
	);
}

export function isAppUserListResponse(value: unknown): value is AppUser[] {
	return Array.isArray(value) && value.every(isAppUserResponse);
}

export function isCreatedAppUserResponse(value: unknown): value is CreatedAppUser {
	const candidate = asRecord(value);
	return (
		candidate !== null &&
		typeof candidate.id === 'number' &&
		typeof candidate.clienteId === 'string' &&
		typeof candidate.clienteSecret === 'string' &&
		typeof candidate.name === 'string' &&
		typeof candidate.description === 'string'
	);
}

function isAssignedRole(value: unknown): value is AssignedRole {
	const candidate = asRecord(value);
	return (
		candidate !== null &&
		typeof candidate.id === 'number' &&
		typeof candidate.name === 'string' &&
		typeof candidate.description === 'string'
	);
}

export function isAssignedApplicationResponse(value: unknown): value is AssignedApplication {
	const candidate = asRecord(value);
	return (
		candidate !== null &&
		typeof candidate.applicationId === 'number' &&
		typeof candidate.applicationName === 'string' &&
		typeof candidate.applicationDescription === 'string' &&
		Array.isArray(candidate.roles) &&
		candidate.roles.every(isAssignedRole)
	);
}

export function isAssignedApplicationListResponse(value: unknown): value is AssignedApplication[] {
	return Array.isArray(value) && value.every(isAssignedApplicationResponse);
}

export function isApplicationConnectionResponse(value: unknown): value is ApplicationConnection {
	const candidate = asRecord(value);
	return (
		candidate !== null &&
		typeof candidate.id === 'number' &&
		typeof candidate.originApplicationId === 'number' &&
		typeof candidate.originApplicationName === 'string' &&
		typeof candidate.destinationApplicationId === 'number' &&
		typeof candidate.destinationApplicationName === 'string'
	);
}

export function isApplicationConnectionListResponse(
	value: unknown,
): value is ApplicationConnection[] {
	return Array.isArray(value) && value.every(isApplicationConnectionResponse);
}
