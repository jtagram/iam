import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	fetchRolesByApplication,
	fetchRolesGroupedByApplication,
	postRole,
} from '../role.connector';
import { createRole, getRolesByApplication, getRolesGroupedByApplication } from '../role.service';

vi.mock('../role.connector');

const invalid = 'Respuesta inválida del servidor.';
const role = { id: 1, applicationId: 5, name: 'admin', description: 'desc' };

afterEach(() => {
	vi.resetAllMocks();
});

describe('getRolesByApplication', () => {
	it('returns the list from the envelope and forwards the signal', async () => {
		vi.mocked(fetchRolesByApplication).mockResolvedValue({
			ok: true,
			msg: 'Listado',
			data: [role],
		});
		const controller = new AbortController();

		expect(await getRolesByApplication(5, controller.signal)).toEqual([role]);
		expect(fetchRolesByApplication).toHaveBeenCalledWith(5, controller.signal);
	});

	it('accepts an empty list', async () => {
		vi.mocked(fetchRolesByApplication).mockResolvedValue({ ok: true, msg: '', data: [] });

		expect(await getRolesByApplication(5)).toEqual([]);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(fetchRolesByApplication).mockResolvedValue({
			ok: false,
			msg: 'Forbidden',
			data: null,
		});

		await expect(getRolesByApplication(5)).rejects.toThrow('Forbidden');
	});

	it('throws the fallback when ok is false and msg is empty', async () => {
		vi.mocked(fetchRolesByApplication).mockResolvedValue({ ok: false, msg: '', data: null });

		await expect(getRolesByApplication(5)).rejects.toThrow('No se pudieron obtener los roles.');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(fetchRolesByApplication).mockResolvedValue({ message: 'legacy' });

		await expect(getRolesByApplication(5)).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when an item has the wrong shape', async () => {
		vi.mocked(fetchRolesByApplication).mockResolvedValue({
			ok: true,
			msg: '',
			data: [role, { id: 'x' }],
		});

		await expect(getRolesByApplication(5)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('No se pudo conectar con el servidor.');
		vi.mocked(fetchRolesByApplication).mockRejectedValue(error);

		await expect(getRolesByApplication(5)).rejects.toBe(error);
	});

	it('lets an AbortError pass through untouched', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		vi.mocked(fetchRolesByApplication).mockRejectedValue(abortError);

		await expect(getRolesByApplication(5, new AbortController().signal)).rejects.toBe(abortError);
	});
});

describe('getRolesGroupedByApplication', () => {
	const group = {
		applicationId: 1,
		applicationName: 'billing',
		applicationDescription: 'desc',
		roles: [{ id: 10, name: 'admin', description: 'd' }],
	};
	const fallback = 'No se pudieron obtener los roles de las aplicaciones.';

	it('returns the list from the envelope and forwards the signal', async () => {
		vi.mocked(fetchRolesGroupedByApplication).mockResolvedValue({
			ok: true,
			msg: 'ok',
			data: [group, { ...group, applicationId: 2, roles: [] }],
		});
		const controller = new AbortController();

		expect(await getRolesGroupedByApplication(controller.signal)).toEqual([
			group,
			{ ...group, applicationId: 2, roles: [] },
		]);
		expect(fetchRolesGroupedByApplication).toHaveBeenCalledWith(controller.signal);
	});

	it('accepts an empty list', async () => {
		vi.mocked(fetchRolesGroupedByApplication).mockResolvedValue({ ok: true, msg: '', data: [] });

		expect(await getRolesGroupedByApplication()).toEqual([]);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(fetchRolesGroupedByApplication).mockResolvedValue({
			ok: false,
			msg: 'Forbidden',
			data: null,
		});

		await expect(getRolesGroupedByApplication()).rejects.toThrow('Forbidden');
	});

	it('throws the fallback when ok is false and msg is empty', async () => {
		vi.mocked(fetchRolesGroupedByApplication).mockResolvedValue({
			ok: false,
			msg: '',
			data: null,
		});

		await expect(getRolesGroupedByApplication()).rejects.toThrow(fallback);
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(fetchRolesGroupedByApplication).mockResolvedValue({ message: 'legacy' });

		await expect(getRolesGroupedByApplication()).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when data has the wrong shape', async () => {
		vi.mocked(fetchRolesGroupedByApplication).mockResolvedValue({
			ok: true,
			msg: '',
			data: [group, { applicationId: 'x' }],
		});

		await expect(getRolesGroupedByApplication()).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('No se pudo conectar con el servidor.');
		vi.mocked(fetchRolesGroupedByApplication).mockRejectedValue(error);

		await expect(getRolesGroupedByApplication()).rejects.toBe(error);
	});

	it('lets an AbortError pass through untouched', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		vi.mocked(fetchRolesGroupedByApplication).mockRejectedValue(abortError);

		await expect(getRolesGroupedByApplication(new AbortController().signal)).rejects.toBe(
			abortError,
		);
	});
});

describe('createRole', () => {
	const payload = { applicationId: 5, name: 'admin', description: 'desc' };

	it('returns the created role', async () => {
		vi.mocked(postRole).mockResolvedValue({ ok: true, msg: 'Creada', data: role });

		expect(await createRole(payload)).toEqual(role);
		expect(postRole).toHaveBeenCalledWith(payload);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(postRole).mockResolvedValue({ ok: false, msg: 'Invalid', data: null });

		await expect(createRole(payload)).rejects.toThrow('Invalid');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(postRole).mockResolvedValue(null);

		await expect(createRole(payload)).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when data has the wrong shape', async () => {
		vi.mocked(postRole).mockResolvedValue({ ok: true, msg: '', data: { id: 1 } });

		await expect(createRole(payload)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('El servidor devolvió una respuesta ilegible.');
		vi.mocked(postRole).mockRejectedValue(error);

		await expect(createRole(payload)).rejects.toBe(error);
	});
});
