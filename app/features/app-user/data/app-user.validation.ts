import type {
	ApplicationConnection,
	AppUser,
	AppUserWithApplications,
	AppUserWithConnections,
	AssignedApplication,
	AssignedApplicationInfo,
	AssignedRole,
	AssignedRoleAssignment,
	ConnectionApplication,
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

function isAssignedRoleAssignment(value: unknown): value is AssignedRoleAssignment {
	const candidate = asRecord(value);
	return (
		candidate !== null &&
		typeof candidate.id === 'number' &&
		typeof candidate.roleId === 'number' &&
		isAssignedRole(candidate.role)
	);
}

function isAssignedApplicationInfo(value: unknown): value is AssignedApplicationInfo {
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
		typeof candidate.id === 'number' &&
		typeof candidate.applicationId === 'number' &&
		isAssignedApplicationInfo(candidate.application) &&
		Array.isArray(candidate.roles) &&
		candidate.roles.every(isAssignedRoleAssignment)
	);
}

export function isAssignedApplicationListResponse(value: unknown): value is AssignedApplication[] {
	return Array.isArray(value) && value.every(isAssignedApplicationResponse);
}

export function isAppUserWithApplicationsResponse(
	value: unknown,
): value is AppUserWithApplications {
	const candidate = asRecord(value);
	return (
		isAppUserResponse(value) &&
		candidate !== null &&
		Array.isArray(candidate.applications) &&
		candidate.applications.every(isAssignedApplicationResponse)
	);
}

function isConnectionApplication(value: unknown): value is ConnectionApplication {
	const candidate = asRecord(value);
	return (
		candidate !== null && typeof candidate.id === 'number' && typeof candidate.name === 'string'
	);
}

export function isApplicationConnectionResponse(value: unknown): value is ApplicationConnection {
	const candidate = asRecord(value);
	return (
		candidate !== null &&
		typeof candidate.id === 'number' &&
		typeof candidate.originApplicationId === 'number' &&
		typeof candidate.destinationApplicationId === 'number' &&
		isConnectionApplication(candidate.originApplication) &&
		isConnectionApplication(candidate.destinationApplication)
	);
}

export function isAppUserWithConnectionsResponse(value: unknown): value is AppUserWithConnections {
	const candidate = asRecord(value);
	return (
		isAppUserResponse(value) &&
		candidate !== null &&
		Array.isArray(candidate.connections) &&
		candidate.connections.every(isApplicationConnectionResponse)
	);
}
