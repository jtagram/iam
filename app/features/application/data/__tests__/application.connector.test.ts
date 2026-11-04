import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchApplications, postApplication } from '../application.connector';

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), { status });
}

const payload = { name: 'app', description: 'desc' };

beforeEach(() => {
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

describe('fetchApplications', () => {
	it('requests /api/applications with the abort signal and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Listado', data: [] };
		fetchMock.mockResolvedValue(jsonResponse(body));
		const controller = new AbortController();

		expect(await fetchApplications(controller.signal)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/applications', { signal: controller.signal });
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 500));

		expect(await fetchApplications()).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(fetchApplications()).rejects.toThrow('No se pudo conectar con el servidor.');
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 502 }));

		await expect(fetchApplications()).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});

	it('rethrows an AbortError unchanged', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		fetchMock.mockRejectedValue(abortError);

		await expect(fetchApplications(new AbortController().signal)).rejects.toBe(abortError);
	});
});

describe('postApplication', () => {
	it('POSTs the JSON payload and returns the body unchanged', async () => {
		const body = { ok: true, msg: 'Creada', data: { id: 1, ...payload } };
		fetchMock.mockResolvedValue(jsonResponse(body, 201));

		expect(await postApplication(payload)).toEqual(body);
		expect(fetchMock).toHaveBeenCalledWith('/api/applications', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	});

	it('returns the envelope of an HTTP error response', async () => {
		const body = { ok: false, msg: 'boom', data: null };
		fetchMock.mockResolvedValue(jsonResponse(body, 400));

		expect(await postApplication(payload)).toEqual(body);
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new Error('network down'));

		await expect(postApplication(payload)).rejects.toThrow('No se pudo conectar con el servidor.');
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 500 }));

		await expect(postApplication(payload)).rejects.toThrow(
			'El servidor devolvió una respuesta ilegible.',
		);
	});
});
