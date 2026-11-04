import {
	fetchRolesByApplication,
	fetchRolesGroupedByApplication,
	postRole,
} from '@/app/features/role/data/role.connector';
import type { ApplicationRoles, CreateRolePayload, Role } from '@/app/features/role/data/role.dto';
import {
	isApplicationRolesListResponse,
	isResponseBody,
	isRoleListResponse,
	isRoleResponse,
} from '@/app/features/role/data/role.validation';

const INVALID_RESPONSE_MESSAGE = 'Respuesta inválida del servidor.';

export async function getRolesByApplication(
	applicationId: number | string,
	signal?: AbortSignal,
): Promise<Role[]> {
	const body = await fetchRolesByApplication(applicationId, signal);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg || 'No se pudieron obtener los roles.');
	}

	if (!isRoleListResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data;
}

export async function getRolesGroupedByApplication(
	signal?: AbortSignal,
): Promise<ApplicationRoles[]> {
	const body = await fetchRolesGroupedByApplication(signal);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg || 'No se pudieron obtener los roles de las aplicaciones.');
	}

	if (!isApplicationRolesListResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data;
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
	const body = await postRole(payload);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}

	if (!isRoleResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data;
}
