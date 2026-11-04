import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	fetchAppUsers,
	fetchAssignedApplications,
	fetchConnectionsForAppUser,
	postAppUser,
	postAssignApplicationToAppUser,
	postAssignRoleToAppUser,
	postConnectionForAppUser,
} from '../app-user.connector';
import {
	assignApplicationToAppUser,
	assignRoleToAppUser,
	createAppUser,
	createConnectionForAppUser,
	getAppUsers,
	getAssignedApplicationsForAppUser,
	getConnectionsForAppUser,
} from '../app-user.service';

vi.mock('../app-user.connector');

const invalid = 'Respuesta inválida del servidor.';
const entity = { id: 1, clienteId: 'c1', name: 'svc', description: 'desc' };
const created = { id: 1, clienteId: 'c1', clienteSecret: 's', name: 'svc', description: 'desc' };
const assigned = {
	applicationId: 2,
	applicationName: 'app',
	applicationDescription: 'd',
	roles: [{ id: 3, name: 'admin', description: 'r' }],
};
const connection = {
	id: 1,
	originApplicationId: 1,
	originApplicationName: 'a',
	destinationApplicationId: 2,
	destinationApplicationName: 'b',
};

afterEach(() => {
	vi.resetAllMocks();
});

describe('getAppUsers', () => {
	it('returns the list from the envelope and forwards the arguments', async () => {
		vi.mocked(fetchAppUsers).mockResolvedValue({ ok: true, msg: 'Listado', data: [entity] });
		const controller = new AbortController();

		expect(await getAppUsers(controller.signal)).toEqual([entity]);
		expect(fetchAppUsers).toHaveBeenCalledWith(controller.signal);
	});

	it('accepts an empty list', async () => {
		vi.mocked(fetchAppUsers).mockResolvedValue({ ok: true, msg: '', data: [] });

		expect(await getAppUsers()).toEqual([]);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(fetchAppUsers).mockResolvedValue({ ok: false, msg: 'Forbidden', data: null });

		await expect(getAppUsers()).rejects.toThrow('Forbidden');
	});

	it('throws the fallback when ok is false and msg is empty', async () => {
		vi.mocked(fetchAppUsers).mockResolvedValue({ ok: false, msg: '', data: null });

		await expect(getAppUsers()).rejects.toThrow(
			'No se pudieron obtener los usuarios de aplicación.',
		);
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(fetchAppUsers).mockResolvedValue({ message: 'legacy' });

		await expect(getAppUsers()).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when an item has the wrong shape', async () => {
		vi.mocked(fetchAppUsers).mockResolvedValue({ ok: true, msg: '', data: [entity, { id: 'x' }] });

		await expect(getAppUsers()).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('No se pudo conectar con el servidor.');
		vi.mocked(fetchAppUsers).mockRejectedValue(error);

		await expect(getAppUsers()).rejects.toBe(error);
	});

	it('lets an AbortError pass through untouched', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		vi.mocked(fetchAppUsers).mockRejectedValue(abortError);

		await expect(getAppUsers(new AbortController().signal)).rejects.toBe(abortError);
	});
});

describe('getAssignedApplicationsForAppUser', () => {
	it('returns the list from the envelope and forwards the arguments', async () => {
		vi.mocked(fetchAssignedApplications).mockResolvedValue({
			ok: true,
			msg: 'Listado',
			data: [assigned],
		});
		const controller = new AbortController();

		expect(await getAssignedApplicationsForAppUser(7, controller.signal)).toEqual([assigned]);
		expect(fetchAssignedApplications).toHaveBeenCalledWith(7, controller.signal);
	});

	it('accepts an empty list', async () => {
		vi.mocked(fetchAssignedApplications).mockResolvedValue({ ok: true, msg: '', data: [] });

		expect(await getAssignedApplicationsForAppUser(7)).toEqual([]);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(fetchAssignedApplications).mockResolvedValue({
			ok: false,
			msg: 'Forbidden',
			data: null,
		});

		await expect(getAssignedApplicationsForAppUser(7)).rejects.toThrow('Forbidden');
	});

	it('throws the fallback when ok is false and msg is empty', async () => {
		vi.mocked(fetchAssignedApplications).mockResolvedValue({ ok: false, msg: '', data: null });

		await expect(getAssignedApplicationsForAppUser(7)).rejects.toThrow(
			'No se pudieron obtener las aplicaciones asignadas.',
		);
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(fetchAssignedApplications).mockResolvedValue({ message: 'legacy' });

		await expect(getAssignedApplicationsForAppUser(7)).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when an item has the wrong shape', async () => {
		vi.mocked(fetchAssignedApplications).mockResolvedValue({
			ok: true,
			msg: '',
			data: [assigned, { id: 'x' }],
		});

		await expect(getAssignedApplicationsForAppUser(7)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('No se pudo conectar con el servidor.');
		vi.mocked(fetchAssignedApplications).mockRejectedValue(error);

		await expect(getAssignedApplicationsForAppUser(7)).rejects.toBe(error);
	});

	it('lets an AbortError pass through untouched', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		vi.mocked(fetchAssignedApplications).mockRejectedValue(abortError);

		await expect(getAssignedApplicationsForAppUser(7, new AbortController().signal)).rejects.toBe(
			abortError,
		);
	});
});

describe('getConnectionsForAppUser', () => {
	it('returns the list from the envelope and forwards the arguments', async () => {
		vi.mocked(fetchConnectionsForAppUser).mockResolvedValue({
			ok: true,
			msg: 'Listado',
			data: [connection],
		});
		const controller = new AbortController();

		expect(await getConnectionsForAppUser(7, controller.signal)).toEqual([connection]);
		expect(fetchConnectionsForAppUser).toHaveBeenCalledWith(7, controller.signal);
	});

	it('accepts an empty list', async () => {
		vi.mocked(fetchConnectionsForAppUser).mockResolvedValue({ ok: true, msg: '', data: [] });

		expect(await getConnectionsForAppUser(7)).toEqual([]);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(fetchConnectionsForAppUser).mockResolvedValue({
			ok: false,
			msg: 'Forbidden',
			data: null,
		});

		await expect(getConnectionsForAppUser(7)).rejects.toThrow('Forbidden');
	});

	it('throws the fallback when ok is false and msg is empty', async () => {
		vi.mocked(fetchConnectionsForAppUser).mockResolvedValue({ ok: false, msg: '', data: null });

		await expect(getConnectionsForAppUser(7)).rejects.toThrow(
			'No se pudieron obtener las conexiones.',
		);
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(fetchConnectionsForAppUser).mockResolvedValue({ message: 'legacy' });

		await expect(getConnectionsForAppUser(7)).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when an item has the wrong shape', async () => {
		vi.mocked(fetchConnectionsForAppUser).mockResolvedValue({
			ok: true,
			msg: '',
			data: [connection, { id: 'x' }],
		});

		await expect(getConnectionsForAppUser(7)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('No se pudo conectar con el servidor.');
		vi.mocked(fetchConnectionsForAppUser).mockRejectedValue(error);

		await expect(getConnectionsForAppUser(7)).rejects.toBe(error);
	});

	it('lets an AbortError pass through untouched', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		vi.mocked(fetchConnectionsForAppUser).mockRejectedValue(abortError);

		await expect(getConnectionsForAppUser(7, new AbortController().signal)).rejects.toBe(
			abortError,
		);
	});
});

describe('createAppUser', () => {
	const payload = { name: 'svc', description: 'desc' };

	it('returns the created data', async () => {
		vi.mocked(postAppUser).mockResolvedValue({ ok: true, msg: 'Hecho', data: created });

		expect(await createAppUser(payload)).toEqual(created);
		expect(postAppUser).toHaveBeenCalledWith(payload);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(postAppUser).mockResolvedValue({ ok: false, msg: 'Invalid', data: null });

		await expect(createAppUser(payload)).rejects.toThrow('Invalid');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(postAppUser).mockResolvedValue(null);

		await expect(createAppUser(payload)).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when data has the wrong shape', async () => {
		vi.mocked(postAppUser).mockResolvedValue({ ok: true, msg: '', data: { id: 1 } });

		await expect(createAppUser(payload)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('El servidor devolvió una respuesta ilegible.');
		vi.mocked(postAppUser).mockRejectedValue(error);

		await expect(createAppUser(payload)).rejects.toBe(error);
	});
});

describe('createConnectionForAppUser', () => {
	const payload = { originApplicationId: 1, destinationApplicationId: 2 };

	it('resolves without a value on success', async () => {
		vi.mocked(postConnectionForAppUser).mockResolvedValue({
			ok: true,
			msg: 'Hecho',
			data: connection,
		});

		expect(await createConnectionForAppUser(7, payload)).toBeUndefined();
		expect(postConnectionForAppUser).toHaveBeenCalledWith(7, payload);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(postConnectionForAppUser).mockResolvedValue({
			ok: false,
			msg: 'Invalid',
			data: null,
		});

		await expect(createConnectionForAppUser(7, payload)).rejects.toThrow('Invalid');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(postConnectionForAppUser).mockResolvedValue(null);

		await expect(createConnectionForAppUser(7, payload)).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when data has the wrong shape', async () => {
		vi.mocked(postConnectionForAppUser).mockResolvedValue({ ok: true, msg: '', data: { id: 1 } });

		await expect(createConnectionForAppUser(7, payload)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('El servidor devolvió una respuesta ilegible.');
		vi.mocked(postConnectionForAppUser).mockRejectedValue(error);

		await expect(createConnectionForAppUser(7, payload)).rejects.toBe(error);
	});
});

describe('assignApplicationToAppUser', () => {
	const payload = { applicationId: 2 };

	it('resolves without a value on success', async () => {
		vi.mocked(postAssignApplicationToAppUser).mockResolvedValue({
			ok: true,
			msg: 'Hecho',
			data: {},
		});

		expect(await assignApplicationToAppUser(7, payload)).toBeUndefined();
		expect(postAssignApplicationToAppUser).toHaveBeenCalledWith(7, payload);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(postAssignApplicationToAppUser).mockResolvedValue({
			ok: false,
			msg: 'Invalid',
			data: null,
		});

		await expect(assignApplicationToAppUser(7, payload)).rejects.toThrow('Invalid');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(postAssignApplicationToAppUser).mockResolvedValue(null);

		await expect(assignApplicationToAppUser(7, payload)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('El servidor devolvió una respuesta ilegible.');
		vi.mocked(postAssignApplicationToAppUser).mockRejectedValue(error);

		await expect(assignApplicationToAppUser(7, payload)).rejects.toBe(error);
	});
});

describe('assignRoleToAppUser', () => {
	const payload = { roleId: 3 };

	it('resolves without a value on success', async () => {
		vi.mocked(postAssignRoleToAppUser).mockResolvedValue({ ok: true, msg: 'Hecho', data: {} });

		expect(await assignRoleToAppUser(7, payload)).toBeUndefined();
		expect(postAssignRoleToAppUser).toHaveBeenCalledWith(7, payload);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(postAssignRoleToAppUser).mockResolvedValue({ ok: false, msg: 'Invalid', data: null });

		await expect(assignRoleToAppUser(7, payload)).rejects.toThrow('Invalid');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(postAssignRoleToAppUser).mockResolvedValue(null);

		await expect(assignRoleToAppUser(7, payload)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('El servidor devolvió una respuesta ilegible.');
		vi.mocked(postAssignRoleToAppUser).mockRejectedValue(error);

		await expect(assignRoleToAppUser(7, payload)).rejects.toBe(error);
	});
});
