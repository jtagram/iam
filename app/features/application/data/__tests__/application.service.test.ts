import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchApplications, postApplication } from '../application.connector';
import { createApplication, getApplications } from '../application.service';

vi.mock('../application.connector');

const invalid = 'Respuesta inválida del servidor.';
const app = { id: 1, name: 'app', description: 'desc' };

afterEach(() => {
	vi.resetAllMocks();
});

describe('getApplications', () => {
	it('returns the list from the envelope and forwards the signal', async () => {
		vi.mocked(fetchApplications).mockResolvedValue({ ok: true, msg: 'Listado', data: [app] });
		const controller = new AbortController();

		expect(await getApplications(controller.signal)).toEqual([app]);
		expect(fetchApplications).toHaveBeenCalledWith(controller.signal);
	});

	it('accepts an empty list', async () => {
		vi.mocked(fetchApplications).mockResolvedValue({ ok: true, msg: '', data: [] });

		expect(await getApplications()).toEqual([]);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(fetchApplications).mockResolvedValue({ ok: false, msg: 'Forbidden', data: null });

		await expect(getApplications()).rejects.toThrow('Forbidden');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(fetchApplications).mockResolvedValue({ message: 'legacy' });

		await expect(getApplications()).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when an item has the wrong shape', async () => {
		vi.mocked(fetchApplications).mockResolvedValue({ ok: true, msg: '', data: [app, { id: 'x' }] });

		await expect(getApplications()).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('No se pudo conectar con el servidor.');
		vi.mocked(fetchApplications).mockRejectedValue(error);

		await expect(getApplications()).rejects.toBe(error);
	});

	it('lets an AbortError pass through untouched', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		vi.mocked(fetchApplications).mockRejectedValue(abortError);

		await expect(getApplications(new AbortController().signal)).rejects.toBe(abortError);
	});
});

describe('createApplication', () => {
	const payload = { name: 'app', description: 'desc' };

	it('returns the created application', async () => {
		vi.mocked(postApplication).mockResolvedValue({ ok: true, msg: 'Creada', data: app });

		expect(await createApplication(payload)).toEqual(app);
		expect(postApplication).toHaveBeenCalledWith(payload);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(postApplication).mockResolvedValue({ ok: false, msg: 'Invalid', data: null });

		await expect(createApplication(payload)).rejects.toThrow('Invalid');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(postApplication).mockResolvedValue(null);

		await expect(createApplication(payload)).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when data has the wrong shape', async () => {
		vi.mocked(postApplication).mockResolvedValue({ ok: true, msg: '', data: { id: 1 } });

		await expect(createApplication(payload)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('El servidor devolvió una respuesta ilegible.');
		vi.mocked(postApplication).mockRejectedValue(error);

		await expect(createApplication(payload)).rejects.toBe(error);
	});
});
