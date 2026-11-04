import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requestJson } from '../request-json';

const fetchMock = vi.fn();

beforeEach(() => {
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

describe('requestJson', () => {
	it('forwards input and init to fetch and returns the parsed body', async () => {
		fetchMock.mockResolvedValue(new Response(JSON.stringify({ a: 1 })));
		const init = { method: 'POST' };

		expect(await requestJson('/x', init)).toEqual({ a: 1 });
		expect(fetchMock).toHaveBeenCalledWith('/x', init);
	});

	it('returns the body of HTTP error responses without checking ok', async () => {
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ ok: false, msg: 'boom', data: null }), { status: 500 }),
		);

		expect(await requestJson('/x')).toEqual({ ok: false, msg: 'boom', data: null });
	});

	it('throws a connection error when fetch fails', async () => {
		fetchMock.mockRejectedValue(new TypeError('network down'));

		await expect(requestJson('/x')).rejects.toThrow('No se pudo conectar con el servidor.');
	});

	it('throws an unreadable-response error when the body is not JSON', async () => {
		fetchMock.mockResolvedValue(new Response('oops', { status: 502 }));

		await expect(requestJson('/x')).rejects.toThrow('El servidor devolvió una respuesta ilegible.');
	});

	it('rethrows an AbortError from fetch unchanged', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		fetchMock.mockRejectedValue(abortError);

		await expect(requestJson('/x')).rejects.toBe(abortError);
	});

	it('rethrows the original error when the signal is already aborted', async () => {
		const failure = new Error('whatever');
		fetchMock.mockRejectedValue(failure);
		const controller = new AbortController();
		controller.abort();

		await expect(requestJson('/x', { signal: controller.signal })).rejects.toBe(failure);
	});

	it('rethrows an AbortError raised while reading the body', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		fetchMock.mockResolvedValue({ json: () => Promise.reject(abortError) });

		await expect(requestJson('/x')).rejects.toBe(abortError);
	});
});
