import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getApplications } from '@/app/features/application/data/application.service';
import { notifyError, notifySuccess } from '@/app/lib/notify';

import { createRole } from '../../data/role.service';
import { CreateRoleForm } from '../create-role-form';

vi.mock('@/app/lib/notify');
vi.mock('@/app/features/application/data/application.service');
vi.mock('../../data/role.service');

beforeEach(() => {
	vi.mocked(getApplications).mockResolvedValue([
		{ id: 1, name: 'billing', description: 'd' },
		{ id: 2, name: 'crm', description: 'd' },
	]);
});

afterEach(() => {
	vi.resetAllMocks();
});

async function fillForm(name = 'admin', description = 'Administrator') {
	const user = userEvent.setup();
	await screen.findByRole('option', { name: 'crm' });
	await user.selectOptions(screen.getByLabelText('Aplicación'), '2');
	await user.type(screen.getByLabelText('Nombre'), name);
	await user.type(screen.getByLabelText('Descripción'), description);
	return user;
}

describe('CreateRoleForm', () => {
	it('lists the available applications', async () => {
		render(<CreateRoleForm />);

		expect(await screen.findByRole('option', { name: 'billing' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'crm' })).toBeInTheDocument();
	});

	it('shows a loading hint until applications arrive', async () => {
		render(<CreateRoleForm />);

		expect(screen.getByText('Cargando…')).toBeInTheDocument();
		await screen.findByRole('option', { name: 'crm' });
		expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
	});

	it('shows an error when applications cannot be loaded', async () => {
		vi.mocked(getApplications).mockRejectedValue(new Error('Apps down'));
		render(<CreateRoleForm />);

		expect(await screen.findByText('Apps down')).toBeInTheDocument();
		expect(screen.queryByText('Cargando…')).not.toBeInTheDocument();
	});

	it('keeps the submit button disabled until the form is valid', async () => {
		render(<CreateRoleForm />);
		const button = screen.getByRole('button', { name: 'Crear' });

		expect(button).toBeDisabled();

		await fillForm();

		expect(button).toBeEnabled();
	});

	it('creates the role with a numeric applicationId and shows success', async () => {
		vi.mocked(createRole).mockResolvedValue({
			id: 5,
			applicationId: 2,
			name: 'admin',
			description: 'Administrator',
		});
		render(<CreateRoleForm />);

		const user = await fillForm();
		await user.click(screen.getByRole('button', { name: 'Crear' }));

		await waitFor(() =>
			expect(notifySuccess).toHaveBeenCalledWith('Rol "admin" creado correctamente.'),
		);
		expect(createRole).toHaveBeenCalledWith({
			applicationId: 2,
			name: 'admin',
			description: 'Administrator',
		});
		expect(screen.getByLabelText('Nombre')).toHaveValue('');
	});

	it('shows the error when creation fails', async () => {
		vi.mocked(createRole).mockRejectedValue(new Error('Duplicated'));
		render(<CreateRoleForm />);

		const user = await fillForm();
		await user.click(screen.getByRole('button', { name: 'Crear' }));

		await waitFor(() => expect(notifyError).toHaveBeenCalledWith('Duplicated'));
	});

	it('validates the maximum length of the name', async () => {
		render(<CreateRoleForm />);

		await fillForm('x'.repeat(31));

		expect(await screen.findByText('Máximo 30 caracteres.')).toHaveClass('text-danger');
		expect(screen.getByRole('button', { name: 'Crear' })).toBeDisabled();
	});
});
