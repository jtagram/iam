import {
	fetchApplications,
	postApplication,
} from '@/app/features/application/data/application.connector';
import type {
	Application,
	CreateApplicationPayload,
} from '@/app/features/application/data/application.dto';
import {
	isApplicationListResponse,
	isApplicationResponse,
	isResponseBody,
} from '@/app/features/application/data/application.validation';

const INVALID_RESPONSE_MESSAGE = 'Respuesta inválida del servidor.';

export async function getApplications(signal?: AbortSignal): Promise<Application[]> {
	const body = await fetchApplications(signal);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg || 'No se pudieron obtener las aplicaciones.');
	}

	if (!isApplicationListResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data;
}

export async function createApplication(payload: CreateApplicationPayload): Promise<Application> {
	const body = await postApplication(payload);

	if (!isResponseBody(body)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	if (!body.ok) {
		throw new Error(body.msg);
	}

	if (!isApplicationResponse(body.data)) {
		throw new Error(INVALID_RESPONSE_MESSAGE);
	}

	return body.data;
}
