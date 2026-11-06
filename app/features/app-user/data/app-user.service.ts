import {
	fetchAppUsers,
	fetchAssignedApplications,
	fetchConnectionsForAppUser,
	postAppUser,
	postAssignApplicationToAppUser,
	postAssignRoleToAppUser,
	postConnectionForAppUser,
} from '@/app/features/app-user/data/app-user.connector';
import type {
	ApplicationConnection,
	AppUser,
	AssignApplicationToAppUserPayload,
	AssignedApplication,
	AssignRoleToAppUserPayload,
	CreateAppUserPayload,
	CreateConnectionPayload,
	CreatedAppUser,
} from '@/app/features/app-user/data/app-user.dto';
import {
	isAppUserListResponse,
	isAppUserWithApplicationsResponse,
	isAppUserWithConnectionsResponse,
	isCreatedAppUserResponse,
	isResponseBody,
} from '@/app/features/app-user/data/app-user.validation';

const INVALID_RESPONSE_MESSAGE = 'Respuesta inválida del servidor.';

export async function getAppUsers(signal?: AbortSignal): Promise<AppUser[]> {
	const body = await fetchAppUsers(signal);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}

	if (!isAppUserListResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data;
}

export async function getAssignedApplicationsForAppUser(
	appUserId: number | string,
	signal?: AbortSignal,
): Promise<AssignedApplication[]> {
	const body = await fetchAssignedApplications(appUserId, signal);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}

	// The endpoint answers with the user and its `applications`; the callers only need the rows.
	if (!isAppUserWithApplicationsResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data.applications;
}

export async function getConnectionsForAppUser(
	appUserId: number | string,
	signal?: AbortSignal,
): Promise<ApplicationConnection[]> {
	const body = await fetchConnectionsForAppUser(appUserId, signal);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}

	if (!isAppUserWithConnectionsResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data.connections;
}

export async function createConnectionForAppUser(
	appUserId: number | string,
	payload: CreateConnectionPayload,
): Promise<void> {
	const body = await postConnectionForAppUser(appUserId, payload);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}

	if (!isAppUserWithConnectionsResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}
}

export async function createAppUser(payload: CreateAppUserPayload): Promise<CreatedAppUser> {
	const body = await postAppUser(payload);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}

	if (!isCreatedAppUserResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data;
}

export async function assignApplicationToAppUser(
	appUserId: number | string,
	payload: AssignApplicationToAppUserPayload,
): Promise<void> {
	const body = await postAssignApplicationToAppUser(appUserId, payload);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}
}

export async function assignRoleToAppUser(
	appUserId: number | string,
	payload: AssignRoleToAppUserPayload,
): Promise<void> {
	const body = await postAssignRoleToAppUser(appUserId, payload);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}
}
