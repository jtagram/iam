import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getApplications } from '@/app/features/application/data/application.service';
import { getRolesByApplication } from '@/app/features/role/data/role.service';
import { notifyError, notifySuccess } from '@/app/lib/notify';

import { assignRoleToInternalUser, getInternalUsers } from '../../data/internal-user.service';
import { AssignRoleToInternalUserForm } from '../assign-role-to-internal-user-form';

vi.mock('@/app/lib/notify');
vi.mock('@/app/features/application/data/application.service');
vi.mock('@/app/features/role/data/role.service');
vi.mock('../../data/internal-user.service');

beforeEach(() => {
	vi.mocked(getInternalUsers).mockResolvedValue([
		{ id: 3, name: 'Ana', lastname: 'Gil', email: 'ana@b.com' },
	]);
	vi.mocked(getApplications).mockResolvedValue([
		{ id: 2, name: 'billing', description: 'd' },
		{ id: 4, name: 'crm', description: 'd' },
	]);
	vi.mocked(getRolesByApplication).mockImplementation((id) =>
		Promise.resolve(
			String(id) === '2'
				? [{ id: 8, applicationId: 2, name: 'admin', description: 'd' }]
				: [{ id: 9, applicationId: 4, name: 'viewer', description: 'd' }],
		),
	);
});

afterEach(() => {
	vi.resetAllMocks();
});

async function fillForm() {
	const user = userEvent.setup();
	await screen.findByRole('option', { name: 'Ana Gil' });
	await screen.findByRole('option', { name: 'billing' });
	await user.selectOptions(screen.getByLabelText('Usuario interno'), '3');
	await user.selectOptions(screen.getByLabelText('Aplicación'), '2');
	await screen.findByRole('option', { name: 'admin' });
	await user.selectOptions(screen.getByLabelText('Rol'), '8');
	return user;
}

describe('AssignRoleToInternalUserForm', () => {
	it('does not load roles before an application is selected', () => {
		render(<AssignRoleToInternalUserForm />);

		expect(getRolesByApplication).not.toHaveBeenCalled();
	});

	it('loads the roles of the selected application', async () => {
		render(<AssignRoleToInternalUserForm />);
		const user = userEvent.setup();
		await screen.findByRole('option', { name: 'crm' });

		await user.selectOptions(screen.getByLabelText('Aplicación'), '4');

		expect(await screen.findByRole('option', { name: 'viewer' })).toBeInTheDocument();
		expect(getRolesByApplication).toHaveBeenCalledWith('4', expect.any(AbortSignal));
		expect(screen.queryByText('Seleccioná una aplicación primero.')).not.toBeInTheDocument();
	});

	it('shows an error when roles cannot be loaded', async () => {
		vi.mocked(getRolesByApplication).mockRejectedValue(new Error('Roles down'));
		render(<AssignRoleToInternalUserForm />);
		const user = userEvent.setup();
		await screen.findByRole('option', { name: 'billing' });

		await user.selectOptions(screen.getByLabelText('Aplicación'), '2');

		expect(await screen.findByText('Roles down')).toBeInTheDocument();
	});

	it('shows an error when users cannot be loaded', async () => {
		vi.mocked(getInternalUsers).mockRejectedValue(new Error('Users down'));
		render(<AssignRoleToInternalUserForm />);

		expect(await screen.findByText('Users down')).toBeInTheDocument();
	});

	it('shows an error when applications cannot be loaded', async () => {
		vi.mocked(getApplications).mockRejectedValue(new Error('Apps down'));
		render(<AssignRoleToInternalUserForm />);

		expect(await screen.findByText('Apps down')).toBeInTheDocument();
	});

	it('resets the selected role when the application changes', async () => {
		render(<AssignRoleToInternalUserForm />);

		const user = await fillForm();
		expect(screen.getByLabelText('Rol')).toHaveValue('8');

		await user.selectOptions(screen.getByLabelText('Aplicación'), '4');

		await screen.findByRole('option', { name: 'viewer' });
		expect(screen.getByLabelText('Rol')).toHaveValue('');
	});

	it('assigns the role and shows success', async () => {
		vi.mocked(assignRoleToInternalUser).mockResolvedValue(undefined);
		render(<AssignRoleToInternalUserForm />);

		const user = await fillForm();
		await user.click(screen.getByRole('button', { name: 'Asignar' }));

		await waitFor(() => expect(notifySuccess).toHaveBeenCalledWith('Rol asignado correctamente.'));
		expect(assignRoleToInternalUser).toHaveBeenCalledWith('3', { roleId: 8 });
	});

	it('shows the error when the assignment fails', async () => {
		vi.mocked(assignRoleToInternalUser).mockRejectedValue(new Error('Already assigned'));
		render(<AssignRoleToInternalUserForm />);

		const user = await fillForm();
		await user.click(screen.getByRole('button', { name: 'Asignar' }));

		await waitFor(() => expect(notifyError).toHaveBeenCalledWith('Already assigned'));
	});

	it('keeps the submit button disabled until the form is complete', async () => {
		render(<AssignRoleToInternalUserForm />);

		expect(screen.getByRole('button', { name: 'Asignar' })).toBeDisabled();

		await fillForm();

		expect(screen.getByRole('button', { name: 'Asignar' })).toBeEnabled();
	});
});
