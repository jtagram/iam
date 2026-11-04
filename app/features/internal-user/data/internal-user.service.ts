import {
	fetchAssignedApplicationsForInternalUser,
	fetchConnectionsForInternalUser,
	fetchInternalUsers,
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
} from '@/app/features/internal-user/data/internal-user.dto';
import {
	isApplicationConnectionListResponse,
	isApplicationConnectionResponse,
	isAssignedApplicationListResponse,
	isInternalUserListResponse,
	isInternalUserResponse,
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

	if (!isAssignedApplicationListResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data;
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

	if (!isApplicationConnectionListResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data;
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

	if (!isApplicationConnectionResponse(body.data)) {
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
