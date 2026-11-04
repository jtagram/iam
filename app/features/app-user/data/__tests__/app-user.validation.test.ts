import { describe, expect, it } from 'vitest';

import {
	isApplicationConnectionListResponse,
	isApplicationConnectionResponse,
	isAppUserListResponse,
	isAppUserResponse,
	isAssignedApplicationListResponse,
	isAssignedApplicationResponse,
	isCreatedAppUserResponse,
	isResponseBody,
} from '../app-user.validation';

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

describe('isResponseBody', () => {
	it.each([
		['an ok envelope', { ok: true, msg: 'x', data: 'a' }],
		['a failed envelope', { ok: false, msg: 'x', data: null }],
		['an envelope with undefined data', { ok: true, msg: '', data: undefined }],
	])('accepts %s', (_label, body) => {
		expect(isResponseBody(body)).toBe(true);
	});

	it.each([
		['null', null],
		['an array', []],
		['a string', 'x'],
		['missing ok', { msg: 'x', data: 'a' }],
		['non-boolean ok', { ok: 'true', msg: 'x', data: 'a' }],
		['missing msg', { ok: true, data: 'a' }],
		['non-string msg', { ok: true, msg: 1, data: 'a' }],
		['missing data', { ok: true, msg: 'x' }],
	])('rejects %s', (_label, body) => {
		expect(isResponseBody(body)).toBe(false);
	});
});

describe('isAppUserResponse', () => {
	it('accepts a valid item', () => {
		expect(isAppUserResponse(entity)).toBe(true);
	});

	it.each([
		['string id', { ...entity, id: '1' }],
		['numeric clienteId', { ...entity, clienteId: 1 }],
		['numeric name', { ...entity, name: 2 }],
		['null description', { ...entity, description: null }],
		['missing clienteId', { id: 1, name: 'a', description: 'd' }],
		['null', null],
		['string', 'x'],
		['number', 1],
		['array', [entity]],
	])('rejects %s', (_label, value) => {
		expect(isAppUserResponse(value)).toBe(false);
	});
});

describe('isAppUserListResponse', () => {
	it('accepts a list of valid items', () => {
		expect(isAppUserListResponse([entity, { ...entity, id: 2 }])).toBe(true);
	});

	it('accepts an empty array', () => {
		expect(isAppUserListResponse([])).toBe(true);
	});

	it('rejects an array containing a bad item', () => {
		expect(isAppUserListResponse([entity, { id: 'x' }])).toBe(false);
	});

	it('rejects non-arrays', () => {
		expect(isAppUserListResponse(entity)).toBe(false);
		expect(isAppUserListResponse(null)).toBe(false);
	});
});

describe('isCreatedAppUserResponse', () => {
	it('accepts a valid created item', () => {
		expect(isCreatedAppUserResponse(created)).toBe(true);
	});

	it.each([
		['missing clienteSecret', entity],
		['numeric clienteSecret', { ...created, clienteSecret: 5 }],
		['string id', { ...created, id: '1' }],
		['null', null],
		['string', 'x'],
		['number', 1],
		['array', [created]],
	])('rejects %s', (_label, value) => {
		expect(isCreatedAppUserResponse(value)).toBe(false);
	});
});

describe('isAssignedApplicationResponse', () => {
	it('accepts a valid assigned application', () => {
		expect(isAssignedApplicationResponse(assigned)).toBe(true);
	});

	it.each([
		['string applicationId', { ...assigned, applicationId: '2' }],
		['numeric applicationName', { ...assigned, applicationName: 1 }],
		['numeric applicationDescription', { ...assigned, applicationDescription: 1 }],
		['missing roles', { applicationId: 2, applicationName: 'a', applicationDescription: 'd' }],
		['non-array roles', { ...assigned, roles: {} }],
		['a bad role', { ...assigned, roles: [{ id: 'x' }] }],
		['null', null],
		['string', 'x'],
		['number', 1],
		['array', [assigned]],
	])('rejects %s', (_label, value) => {
		expect(isAssignedApplicationResponse(value)).toBe(false);
	});
});

describe('isAssignedApplicationListResponse', () => {
	it('accepts a list of valid items', () => {
		expect(isAssignedApplicationListResponse([assigned, { ...assigned, id: 2 }])).toBe(true);
	});

	it('accepts an empty array', () => {
		expect(isAssignedApplicationListResponse([])).toBe(true);
	});

	it('rejects an array containing a bad item', () => {
		expect(isAssignedApplicationListResponse([assigned, { id: 'x' }])).toBe(false);
	});

	it('rejects non-arrays', () => {
		expect(isAssignedApplicationListResponse(assigned)).toBe(false);
		expect(isAssignedApplicationListResponse(null)).toBe(false);
	});
});

describe('isApplicationConnectionResponse', () => {
	it('accepts a valid connection', () => {
		expect(isApplicationConnectionResponse(connection)).toBe(true);
	});

	it.each([
		['string id', { ...connection, id: '1' }],
		['string originApplicationId', { ...connection, originApplicationId: '1' }],
		['numeric originApplicationName', { ...connection, originApplicationName: 1 }],
		['string destinationApplicationId', { ...connection, destinationApplicationId: '2' }],
		['numeric destinationApplicationName', { ...connection, destinationApplicationName: 2 }],
		['missing fields', { id: 1 }],
		['null', null],
		['string', 'x'],
		['number', 1],
		['array', [connection]],
	])('rejects %s', (_label, value) => {
		expect(isApplicationConnectionResponse(value)).toBe(false);
	});
});

describe('isApplicationConnectionListResponse', () => {
	it('accepts a list of valid items', () => {
		expect(isApplicationConnectionListResponse([connection, { ...connection, id: 2 }])).toBe(true);
	});

	it('accepts an empty array', () => {
		expect(isApplicationConnectionListResponse([])).toBe(true);
	});

	it('rejects an array containing a bad item', () => {
		expect(isApplicationConnectionListResponse([connection, { id: 'x' }])).toBe(false);
	});

	it('rejects non-arrays', () => {
		expect(isApplicationConnectionListResponse(connection)).toBe(false);
		expect(isApplicationConnectionListResponse(null)).toBe(false);
	});
});
