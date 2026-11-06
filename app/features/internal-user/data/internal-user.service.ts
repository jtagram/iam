import {
	fetchAssignedApplicationsForInternalUser,
	fetchConnectionsForInternalUser,
	fetchInternalUsers,
	fetchInternalUsersWithApplications,
	postAssignApplicationToInternalUser,
	postAssignRoleToInternalUser,
	postConnectionForInternalUser,
	postInternalUser,
} from '@/app/features/internal-user/data/internal-user.connector';
import type {
	ApplicationConnection,
	AssignApplicationToInternalUserPayload,
	AssignedApplication,
	AssignRoleToInternalUserPayload,
	CreateConnectionPayload,
	CreatedInternalUser,
	CreateInternalUserPayload,
	InternalUser,
	InternalUserWithApplications,
} from '@/app/features/internal-user/data/internal-user.dto';
import {
	isInternalUserListResponse,
	isInternalUserResponse,
	isInternalUserWithApplicationsListResponse,
	isInternalUserWithApplicationsResponse,
	isInternalUserWithConnectionsResponse,
	isResponseBody,
} from '@/app/features/internal-user/data/internal-user.validation';

const INVALID_RESPONSE_MESSAGE = 'Respuesta inválida del servidor.';

export async function getInternalUsers(signal?: AbortSignal): Promise<InternalUser[]> {
	const body = await fetchInternalUsers(signal);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}

	if (!isInternalUserListResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data;
}

export async function getInternalUsersWithApplications(
	signal?: AbortSignal,
): Promise<InternalUserWithApplications[]> {
	const body = await fetchInternalUsersWithApplications(signal);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}

	if (!isInternalUserWithApplicationsListResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data;
}

export async function getAssignedApplicationsForInternalUser(
	internalUserId: number | string,
	signal?: AbortSignal,
): Promise<AssignedApplication[]> {
	const body = await fetchAssignedApplicationsForInternalUser(internalUserId, signal);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}

	// The endpoint answers with the user and its `applications`; the callers only need the rows.
	if (!isInternalUserWithApplicationsResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data.applications;
}

export async function getConnectionsForInternalUser(
	internalUserId: number | string,
	signal?: AbortSignal,
): Promise<ApplicationConnection[]> {
	const body = await fetchConnectionsForInternalUser(internalUserId, signal);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}

	if (!isInternalUserWithConnectionsResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data.connections;
}

export async function createConnectionForInternalUser(
	internalUserId: number | string,
	payload: CreateConnectionPayload,
): Promise<void> {
	const body = await postConnectionForInternalUser(internalUserId, payload);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}

	if (!isInternalUserWithConnectionsResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}
}

export async function createInternalUser(
	payload: CreateInternalUserPayload,
): Promise<CreatedInternalUser> {
	const body = await postInternalUser(payload);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}

	if (!isInternalUserResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data;
}

export async function assignApplicationToInternalUser(
	internalUserId: number | string,
	payload: AssignApplicationToInternalUserPayload,
): Promise<void> {
	const body = await postAssignApplicationToInternalUser(internalUserId, payload);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}
}

export async function assignRoleToInternalUser(
	internalUserId: number | string,
	payload: AssignRoleToInternalUserPayload,
): Promise<void> {
	const body = await postAssignRoleToInternalUser(internalUserId, payload);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}
}
