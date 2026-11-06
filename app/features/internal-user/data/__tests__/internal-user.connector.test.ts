import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	fetchAssignedApplicationsForInternalUser,
	fetchConnectionsForInternalUser,
	fetchInternalUsers,
	fetchInternalUsersWithApplications,
	postAssignApplicationToInternalUser,
	postAssignRoleToInternalUser,
	postConnectionForInternalUser,
	postInternalUser,
} from '../internal-user.connector';

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

describe('fetchInternalUsersWithApplications', () => {
	it('requests /api/internal-users/with-applications with the abort signal and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Listado', data: [] };
		fetchMock.mockResolvedValue(jsonResponse(body));
		const controller = new AbortController();

		expect(await fetchInternalUsersWithApplications(controller.signal)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/internal-users/with-applications', {
			signal: controller.signal,
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 500));

		expect(await fetchInternalUsersWithApplications()).toEqual(body);
	});
});

describe('fetchInternalUsers', () => {
	it('requests /api/internal-users with the abort signal and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Listado', data: [] };
		fetchMock.mockResolvedValue(jsonResponse(body));
		const controller = new AbortController();

		expect(await fetchInternalUsers(controller.signal)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/internal-users', { signal: controller.signal });
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 500));

		expect(await fetchInternalUsers()).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(fetchInternalUsers()).rejects.toThrow('No se pudo conectar con el servidor.');
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 502 }));

		await expect(fetchInternalUsers()).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});

	it('rethrows an AbortError unchanged', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		fetchMock.mockRejectedValue(abortError);

		await expect(fetchInternalUsers(new AbortController().signal)).rejects.toBe(abortError);
	});
});

describe('fetchAssignedApplicationsForInternalUser', () => {
	it('requests /api/internal-users/7/applications with the abort signal and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Listado', data: [] };
		fetchMock.mockResolvedValue(jsonResponse(body));
		const controller = new AbortController();

		expect(await fetchAssignedApplicationsForInternalUser(7, controller.signal)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/internal-users/7/applications', {
			signal: controller.signal,
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 500));

		expect(await fetchAssignedApplicationsForInternalUser(7)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(fetchAssignedApplicationsForInternalUser(7)).rejects.toThrow(
			'No se pudo conectar con el servidor.',
		);
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 502 }));

		await expect(fetchAssignedApplicationsForInternalUser(7)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});

	it('rethrows an AbortError unchanged', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		fetchMock.mockRejectedValue(abortError);

		await expect(
			fetchAssignedApplicationsForInternalUser(7, new AbortController().signal),
		).rejects.toBe(abortError);
	});
});

describe('fetchConnectionsForInternalUser', () => {
	it('requests /api/internal-users/7/connections with the abort signal and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Listado', data: [] };
		fetchMock.mockResolvedValue(jsonResponse(body));
		const controller = new AbortController();

		expect(await fetchConnectionsForInternalUser(7, controller.signal)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/internal-users/7/connections', {
			signal: controller.signal,
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 500));

		expect(await fetchConnectionsForInternalUser(7)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(fetchConnectionsForInternalUser(7)).rejects.toThrow(
			'No se pudo conectar con el servidor.',
		);
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 502 }));

		await expect(fetchConnectionsForInternalUser(7)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});

	it('rethrows an AbortError unchanged', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		fetchMock.mockRejectedValue(abortError);

		await expect(fetchConnectionsForInternalUser(7, new AbortController().signal)).rejects.toBe(
			abortError,
		);
	});
});

describe('postInternalUser', () => {
	const payload = { name: 'Ana', lastname: 'Pérez', email: 'ana@x.com', password: 'secret' };

	it('POSTs the JSON payload and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Hecho', data: { id: 1 } };
		fetchMock.mockResolvedValue(jsonResponse(body, 201));

		expect(await postInternalUser(payload)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/internal-users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 400));

		expect(await postInternalUser(payload)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(postInternalUser(payload)).rejects.toThrow('No se pudo conectar con el servidor.');
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 500 }));

		await expect(postInternalUser(payload)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});
});

describe('postConnectionForInternalUser', () => {
	const payload = { originApplicationId: 1, destinationApplicationId: 2 };

	it('POSTs the JSON payload and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Hecho', data: { id: 1 } };
		fetchMock.mockResolvedValue(jsonResponse(body, 201));

		expect(await postConnectionForInternalUser(7, payload)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/internal-users/7/connections', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 400));

		expect(await postConnectionForInternalUser(7, payload)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(postConnectionForInternalUser(7, payload)).rejects.toThrow(
			'No se pudo conectar con el servidor.',
		);
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 500 }));

		await expect(postConnectionForInternalUser(7, payload)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});
});

describe('postAssignApplicationToInternalUser', () => {
	const payload = { applicationId: 2 };

	it('POSTs the JSON payload and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Hecho', data: { id: 1 } };
		fetchMock.mockResolvedValue(jsonResponse(body, 201));

		expect(await postAssignApplicationToInternalUser(7, payload)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/internal-users/7/applications', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 400));

		expect(await postAssignApplicationToInternalUser(7, payload)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(postAssignApplicationToInternalUser(7, payload)).rejects.toThrow(
			'No se pudo conectar con el servidor.',
		);
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 500 }));

		await expect(postAssignApplicationToInternalUser(7, payload)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});
});

describe('postAssignRoleToInternalUser', () => {
	const payload = { roleId: 3 };

	it('POSTs the JSON payload and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Hecho', data: { id: 1 } };
		fetchMock.mockResolvedValue(jsonResponse(body, 201));

		expect(await postAssignRoleToInternalUser(7, payload)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/internal-users/7/roles', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 400));

		expect(await postAssignRoleToInternalUser(7, payload)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(postAssignRoleToInternalUser(7, payload)).rejects.toThrow(
			'No se pudo conectar con el servidor.',
		);
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 500 }));

		await expect(postAssignRoleToInternalUser(7, payload)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});
});
