import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	fetchRolesByApplication,
	fetchRolesGroupedByApplication,
	postRole,
} from '../role.connector';

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), { status });
}

const payload = { applicationId: 5, name: 'admin', description: 'desc' };

beforeEach(() => {
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

describe('fetchRolesByApplication', () => {
	it('requests /api/roles?applicationId=5 with the abort signal and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Listado', data: [] };
		fetchMock.mockResolvedValue(jsonResponse(body));
		const controller = new AbortController();

		expect(await fetchRolesByApplication(5, controller.signal)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/roles?applicationId=5', {
			signal: controller.signal,
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 500));

		expect(await fetchRolesByApplication(5)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(fetchRolesByApplication(5)).rejects.toThrow(
			'No se pudo conectar con el servidor.',
		);
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 502 }));

		await expect(fetchRolesByApplication(5)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});

	it('rethrows an AbortError unchanged', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		fetchMock.mockRejectedValue(abortError);

		await expect(fetchRolesByApplication(5, new AbortController().signal)).rejects.toBe(abortError);
	});
});

describe('fetchRolesGroupedByApplication', () => {
	it('requests /api/roles/grouped-by-application with the abort signal and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Listado', data: [] };
		fetchMock.mockResolvedValue(jsonResponse(body));
		const controller = new AbortController();

		expect(await fetchRolesGroupedByApplication(controller.signal)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/roles/grouped-by-application', {
			signal: controller.signal,
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 500));

		expect(await fetchRolesGroupedByApplication()).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(fetchRolesGroupedByApplication()).rejects.toThrow(
			'No se pudo conectar con el servidor.',
		);
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 502 }));

		await expect(fetchRolesGroupedByApplication()).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});

	it('rethrows an AbortError unchanged', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		fetchMock.mockRejectedValue(abortError);

		await expect(fetchRolesGroupedByApplication(new AbortController().signal)).rejects.toBe(
			abortError,
		);
	});
});

describe('postRole', () => {
	it('POSTs the JSON payload and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Creada', data: { id: 1, ...payload } };
		fetchMock.mockResolvedValue(jsonResponse(body, 201));

		expect(await postRole(payload)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/roles', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 400));

		expect(await postRole(payload)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(postRole(payload)).rejects.toThrow('No se pudo conectar con el servidor.');
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 500 }));

		await expect(postRole(payload)).rejects.toThrow('El servidor devolvió una respuesta ilegible.');
	});
});
