import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	fetchAppUsers,
	fetchAssignedApplications,
	fetchConnectionsForAppUser,
	postAppUser,
	postAssignApplicationToAppUser,
	postAssignRoleToAppUser,
	postConnectionForAppUser,
} from '../app-user.connector';

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

describe('fetchAppUsers', () => {
	it('requests /api/apps-users with the abort signal and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Listado', data: [] };
		fetchMock.mockResolvedValue(jsonResponse(body));
		const controller = new AbortController();

		expect(await fetchAppUsers(controller.signal)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/apps-users', { signal: controller.signal });
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 500));

		expect(await fetchAppUsers()).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(fetchAppUsers()).rejects.toThrow('No se pudo conectar con el servidor.');
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 502 }));

		await expect(fetchAppUsers()).rejects.toThrow('El servidor devolvió una respuesta ilegible.');
	});

	it('rethrows an AbortError unchanged', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		fetchMock.mockRejectedValue(abortError);

		await expect(fetchAppUsers(new AbortController().signal)).rejects.toBe(abortError);
	});
});

describe('fetchAssignedApplications', () => {
	it('requests /api/apps-users/7/applications with the abort signal and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Listado', data: [] };
		fetchMock.mockResolvedValue(jsonResponse(body));
		const controller = new AbortController();

		expect(await fetchAssignedApplications(7, controller.signal)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/apps-users/7/applications', {
			signal: controller.signal,
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 500));

		expect(await fetchAssignedApplications(7)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(fetchAssignedApplications(7)).rejects.toThrow(
			'No se pudo conectar con el servidor.',
		);
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 502 }));

		await expect(fetchAssignedApplications(7)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});

	it('rethrows an AbortError unchanged', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		fetchMock.mockRejectedValue(abortError);

		await expect(fetchAssignedApplications(7, new AbortController().signal)).rejects.toBe(
			abortError,
		);
	});
});

describe('fetchConnectionsForAppUser', () => {
	it('requests /api/apps-users/7/connections with the abort signal and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Listado', data: [] };
		fetchMock.mockResolvedValue(jsonResponse(body));
		const controller = new AbortController();

		expect(await fetchConnectionsForAppUser(7, controller.signal)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/apps-users/7/connections', {
			signal: controller.signal,
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 500));

		expect(await fetchConnectionsForAppUser(7)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(fetchConnectionsForAppUser(7)).rejects.toThrow(
			'No se pudo conectar con el servidor.',
		);
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 502 }));

		await expect(fetchConnectionsForAppUser(7)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});

	it('rethrows an AbortError unchanged', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		fetchMock.mockRejectedValue(abortError);

		await expect(fetchConnectionsForAppUser(7, new AbortController().signal)).rejects.toBe(
			abortError,
		);
	});
});

describe('postAppUser', () => {
	const payload = { name: 'svc', description: 'desc' };

	it('POSTs the JSON payload and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Hecho', data: { id: 1 } };
		fetchMock.mockResolvedValue(jsonResponse(body, 201));

		expect(await postAppUser(payload)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/apps-users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 400));

		expect(await postAppUser(payload)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(postAppUser(payload)).rejects.toThrow('No se pudo conectar con el servidor.');
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 500 }));

		await expect(postAppUser(payload)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});
});

describe('postConnectionForAppUser', () => {
	const payload = { originApplicationId: 1, destinationApplicationId: 2 };

	it('POSTs the JSON payload and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Hecho', data: { id: 1 } };
		fetchMock.mockResolvedValue(jsonResponse(body, 201));

		expect(await postConnectionForAppUser(7, payload)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/apps-users/7/connections', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 400));

		expect(await postConnectionForAppUser(7, payload)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(postConnectionForAppUser(7, payload)).rejects.toThrow(
			'No se pudo conectar con el servidor.',
		);
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 500 }));

		await expect(postConnectionForAppUser(7, payload)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});
});

describe('postAssignApplicationToAppUser', () => {
	const payload = { applicationId: 2 };

	it('POSTs the JSON payload and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Hecho', data: { id: 1 } };
		fetchMock.mockResolvedValue(jsonResponse(body, 201));

		expect(await postAssignApplicationToAppUser(7, payload)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/apps-users/7/applications', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 400));

		expect(await postAssignApplicationToAppUser(7, payload)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(postAssignApplicationToAppUser(7, payload)).rejects.toThrow(
			'No se pudo conectar con el servidor.',
		);
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 500 }));

		await expect(postAssignApplicationToAppUser(7, payload)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});
});

describe('postAssignRoleToAppUser', () => {
	const payload = { roleId: 3 };

	it('POSTs the JSON payload and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Hecho', data: { id: 1 } };
		fetchMock.mockResolvedValue(jsonResponse(body, 201));

		expect(await postAssignRoleToAppUser(7, payload)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/apps-users/7/roles', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 400));

		expect(await postAssignRoleToAppUser(7, payload)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(postAssignRoleToAppUser(7, payload)).rejects.toThrow(
			'No se pudo conectar con el servidor.',
		);
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 500 }));

		await expect(postAssignRoleToAppUser(7, payload)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});
});
