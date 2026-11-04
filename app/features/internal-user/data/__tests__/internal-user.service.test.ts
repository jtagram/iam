import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	fetchAssignedApplicationsForInternalUser,
	fetchConnectionsForInternalUser,
	fetchInternalUsers,
	postAssignApplicationToInternalUser,
	postAssignRoleToInternalUser,
	postConnectionForInternalUser,
	postInternalUser,
} from '../internal-user.connector';
import {
	assignApplicationToInternalUser,
	assignRoleToInternalUser,
	createConnectionForInternalUser,
	createInternalUser,
	getAssignedApplicationsForInternalUser,
	getConnectionsForInternalUser,
	getInternalUsers,
} from '../internal-user.service';

vi.mock('../internal-user.connector');

const invalid = 'Respuesta inválida del servidor.';
const entity = { id: 1, name: 'Ana', lastname: 'Pérez', email: 'ana@x.com' };
const created = { id: 1, name: 'Ana', lastname: 'Pérez', email: 'ana@x.com' };
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

describe('getInternalUsers', () => {
	it('returns the list from the envelope and forwards the arguments', async () => {
		vi.mocked(fetchInternalUsers).mockResolvedValue({ ok: true, msg: 'Listado', data: [entity] });
		const controller = new AbortController();

		expect(await getInternalUsers(controller.signal)).toEqual([entity]);
		expect(fetchInternalUsers).toHaveBeenCalledWith(controller.signal);
	});

	it('accepts an empty list', async () => {
		vi.mocked(fetchInternalUsers).mockResolvedValue({ ok: true, msg: '', data: [] });

		expect(await getInternalUsers()).toEqual([]);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(fetchInternalUsers).mockResolvedValue({ ok: false, msg: 'Forbidden', data: null });

		await expect(getInternalUsers()).rejects.toThrow('Forbidden');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(fetchInternalUsers).mockResolvedValue({ message: 'legacy' });

		await expect(getInternalUsers()).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when an item has the wrong shape', async () => {
		vi.mocked(fetchInternalUsers).mockResolvedValue({
			ok: true,
			msg: '',
			data: [entity, { id: 'x' }],
		});

		await expect(getInternalUsers()).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('No se pudo conectar con el servidor.');
		vi.mocked(fetchInternalUsers).mockRejectedValue(error);

		await expect(getInternalUsers()).rejects.toBe(error);
	});

	it('lets an AbortError pass through untouched', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		vi.mocked(fetchInternalUsers).mockRejectedValue(abortError);

		await expect(getInternalUsers(new AbortController().signal)).rejects.toBe(abortError);
	});
});

describe('getAssignedApplicationsForInternalUser', () => {
	it('returns the list from the envelope and forwards the arguments', async () => {
		vi.mocked(fetchAssignedApplicationsForInternalUser).mockResolvedValue({
			ok: true,
			msg: 'Listado',
			data: [assigned],
		});
		const controller = new AbortController();

		expect(await getAssignedApplicationsForInternalUser(7, controller.signal)).toEqual([assigned]);
		expect(fetchAssignedApplicationsForInternalUser).toHaveBeenCalledWith(7, controller.signal);
	});

	it('accepts an empty list', async () => {
		vi.mocked(fetchAssignedApplicationsForInternalUser).mockResolvedValue({
			ok: true,
			msg: '',
			data: [],
		});

		expect(await getAssignedApplicationsForInternalUser(7)).toEqual([]);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(fetchAssignedApplicationsForInternalUser).mockResolvedValue({
			ok: false,
			msg: 'Forbidden',
			data: null,
		});

		await expect(getAssignedApplicationsForInternalUser(7)).rejects.toThrow('Forbidden');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(fetchAssignedApplicationsForInternalUser).mockResolvedValue({ message: 'legacy' });

		await expect(getAssignedApplicationsForInternalUser(7)).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when an item has the wrong shape', async () => {
		vi.mocked(fetchAssignedApplicationsForInternalUser).mockResolvedValue({
			ok: true,
			msg: '',
			data: [assigned, { id: 'x' }],
		});

		await expect(getAssignedApplicationsForInternalUser(7)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('No se pudo conectar con el servidor.');
		vi.mocked(fetchAssignedApplicationsForInternalUser).mockRejectedValue(error);

		await expect(getAssignedApplicationsForInternalUser(7)).rejects.toBe(error);
	});

	it('lets an AbortError pass through untouched', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		vi.mocked(fetchAssignedApplicationsForInternalUser).mockRejectedValue(abortError);

		await expect(
			getAssignedApplicationsForInternalUser(7, new AbortController().signal),
		).rejects.toBe(abortError);
	});
});

describe('getConnectionsForInternalUser', () => {
	it('returns the list from the envelope and forwards the arguments', async () => {
		vi.mocked(fetchConnectionsForInternalUser).mockResolvedValue({
			ok: true,
			msg: 'Listado',
			data: [connection],
		});
		const controller = new AbortController();

		expect(await getConnectionsForInternalUser(7, controller.signal)).toEqual([connection]);
		expect(fetchConnectionsForInternalUser).toHaveBeenCalledWith(7, controller.signal);
	});

	it('accepts an empty list', async () => {
		vi.mocked(fetchConnectionsForInternalUser).mockResolvedValue({ ok: true, msg: '', data: [] });

		expect(await getConnectionsForInternalUser(7)).toEqual([]);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(fetchConnectionsForInternalUser).mockResolvedValue({
			ok: false,
			msg: 'Forbidden',
			data: null,
		});

		await expect(getConnectionsForInternalUser(7)).rejects.toThrow('Forbidden');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(fetchConnectionsForInternalUser).mockResolvedValue({ message: 'legacy' });

		await expect(getConnectionsForInternalUser(7)).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when an item has the wrong shape', async () => {
		vi.mocked(fetchConnectionsForInternalUser).mockResolvedValue({
			ok: true,
			msg: '',
			data: [connection, { id: 'x' }],
		});

		await expect(getConnectionsForInternalUser(7)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('No se pudo conectar con el servidor.');
		vi.mocked(fetchConnectionsForInternalUser).mockRejectedValue(error);

		await expect(getConnectionsForInternalUser(7)).rejects.toBe(error);
	});

	it('lets an AbortError pass through untouched', async () => {
		const abortError = new DOMException('aborted', 'AbortError');
		vi.mocked(fetchConnectionsForInternalUser).mockRejectedValue(abortError);

		await expect(getConnectionsForInternalUser(7, new AbortController().signal)).rejects.toBe(
			abortError,
		);
	});
});

describe('createInternalUser', () => {
	const payload = { name: 'Ana', lastname: 'Pérez', email: 'ana@x.com', password: 'secret' };

	it('returns the created data', async () => {
		vi.mocked(postInternalUser).mockResolvedValue({ ok: true, msg: 'Hecho', data: created });

		expect(await createInternalUser(payload)).toEqual(created);
		expect(postInternalUser).toHaveBeenCalledWith(payload);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(postInternalUser).mockResolvedValue({ ok: false, msg: 'Invalid', data: null });

		await expect(createInternalUser(payload)).rejects.toThrow('Invalid');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(postInternalUser).mockResolvedValue(null);

		await expect(createInternalUser(payload)).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when data has the wrong shape', async () => {
		vi.mocked(postInternalUser).mockResolvedValue({ ok: true, msg: '', data: { id: 1 } });

		await expect(createInternalUser(payload)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('El servidor devolvió una respuesta ilegible.');
		vi.mocked(postInternalUser).mockRejectedValue(error);

		await expect(createInternalUser(payload)).rejects.toBe(error);
	});
});

describe('createConnectionForInternalUser', () => {
	const payload = { originApplicationId: 1, destinationApplicationId: 2 };

	it('resolves without a value on success', async () => {
		vi.mocked(postConnectionForInternalUser).mockResolvedValue({
			ok: true,
			msg: 'Hecho',
			data: connection,
		});

		expect(await createConnectionForInternalUser(7, payload)).toBeUndefined();
		expect(postConnectionForInternalUser).toHaveBeenCalledWith(7, payload);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(postConnectionForInternalUser).mockResolvedValue({
			ok: false,
			msg: 'Invalid',
			data: null,
		});

		await expect(createConnectionForInternalUser(7, payload)).rejects.toThrow('Invalid');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(postConnectionForInternalUser).mockResolvedValue(null);

		await expect(createConnectionForInternalUser(7, payload)).rejects.toThrow(invalid);
	});

	it('throws an invalid-response error when data has the wrong shape', async () => {
		vi.mocked(postConnectionForInternalUser).mockResolvedValue({
			ok: true,
			msg: '',
			data: { id: 1 },
		});

		await expect(createConnectionForInternalUser(7, payload)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('El servidor devolvió una respuesta ilegible.');
		vi.mocked(postConnectionForInternalUser).mockRejectedValue(error);

		await expect(createConnectionForInternalUser(7, payload)).rejects.toBe(error);
	});
});

describe('assignApplicationToInternalUser', () => {
	const payload = { applicationId: 2 };

	it('resolves without a value on success', async () => {
		vi.mocked(postAssignApplicationToInternalUser).mockResolvedValue({
			ok: true,
			msg: 'Hecho',
			data: {},
		});

		expect(await assignApplicationToInternalUser(7, payload)).toBeUndefined();
		expect(postAssignApplicationToInternalUser).toHaveBeenCalledWith(7, payload);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(postAssignApplicationToInternalUser).mockResolvedValue({
			ok: false,
			msg: 'Invalid',
			data: null,
		});

		await expect(assignApplicationToInternalUser(7, payload)).rejects.toThrow('Invalid');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(postAssignApplicationToInternalUser).mockResolvedValue(null);

		await expect(assignApplicationToInternalUser(7, payload)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('El servidor devolvió una respuesta ilegible.');
		vi.mocked(postAssignApplicationToInternalUser).mockRejectedValue(error);

		await expect(assignApplicationToInternalUser(7, payload)).rejects.toBe(error);
	});
});

describe('assignRoleToInternalUser', () => {
	const payload = { roleId: 3 };

	it('resolves without a value on success', async () => {
		vi.mocked(postAssignRoleToInternalUser).mockResolvedValue({ ok: true, msg: 'Hecho', data: {} });

		expect(await assignRoleToInternalUser(7, payload)).toBeUndefined();
		expect(postAssignRoleToInternalUser).toHaveBeenCalledWith(7, payload);
	});

	it('throws the envelope msg when ok is false', async () => {
		vi.mocked(postAssignRoleToInternalUser).mockResolvedValue({
			ok: false,
			msg: 'Invalid',
			data: null,
		});

		await expect(assignRoleToInternalUser(7, payload)).rejects.toThrow('Invalid');
	});

	it('throws an invalid-response error for a malformed envelope', async () => {
		vi.mocked(postAssignRoleToInternalUser).mockResolvedValue(null);

		await expect(assignRoleToInternalUser(7, payload)).rejects.toThrow(invalid);
	});

	it('propagates errors thrown by the connector', async () => {
		const error = new Error('El servidor devolvió una respuesta ilegible.');
		vi.mocked(postAssignRoleToInternalUser).mockRejectedValue(error);

		await expect(assignRoleToInternalUser(7, payload)).rejects.toBe(error);
	});
});
