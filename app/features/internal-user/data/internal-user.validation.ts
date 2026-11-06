import type {
	ApplicationConnection,
	AssignedApplication,
	AssignedApplicationInfo,
	AssignedRole,
	AssignedRoleAssignment,
	ConnectionApplication,
	InternalUser,
	InternalUserWithApplications,
	InternalUserWithConnections,
} from '@/app/features/internal-user/data/internal-user.dto';

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

export function isInternalUserResponse(value: unknown): value is InternalUser {
	const candidate = asRecord(value);
	return (
		candidate !== null &&
		typeof candidate.id === 'number' &&
		typeof candidate.name === 'string' &&
		typeof candidate.lastname === 'string' &&
		typeof candidate.email === 'string'
	);
}

export function isInternalUserListResponse(value: unknown): value is InternalUser[] {
	return Array.isArray(value) && value.every(isInternalUserResponse);
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

export function isInternalUserWithApplicationsResponse(
	value: unknown,
): value is InternalUserWithApplications {
	const candidate = asRecord(value);
	return (
		isInternalUserResponse(value) &&
		candidate !== null &&
		Array.isArray(candidate.applications) &&
		candidate.applications.every(isAssignedApplicationResponse)
	);
}

export function isInternalUserWithApplicationsListResponse(
	value: unknown,
): value is InternalUserWithApplications[] {
	return Array.isArray(value) && value.every(isInternalUserWithApplicationsResponse);
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

export function isInternalUserWithConnectionsResponse(
	value: unknown,
): value is InternalUserWithConnections {
	const candidate = asRecord(value);
	return (
		isInternalUserResponse(value) &&
		candidate !== null &&
		Array.isArray(candidate.connections) &&
		candidate.connections.every(isApplicationConnectionResponse)
	);
}
