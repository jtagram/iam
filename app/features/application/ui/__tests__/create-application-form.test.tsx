import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { notifyError, notifySuccess } from '@/app/lib/notify';

import type { Application } from '../../data/application.dto';
import { createApplication } from '../../data/application.service';
import { CreateApplicationForm } from '../create-application-form';

vi.mock('../../data/application.service');
vi.mock('@/app/lib/notify');

afterEach(() => {
	vi.resetAllMocks();
});

async function fillForm(name = 'billing', description = 'Billing app') {
	const user = userEvent.setup();
	await user.type(screen.getByLabelText('Nombre'), name);
	await user.type(screen.getByLabelText('Descripción'), description);
	return user;
}

describe('CreateApplicationForm', () => {
	it('disables the submit button until the form is valid', async () => {
		render(<CreateApplicationForm />);
		const button = screen.getByRole('button', { name: 'Crear' });

		expect(button).toBeDisabled();

		await fillForm();

		expect(button).toBeEnabled();
	});

	it('creates the application and shows a success message', async () => {
		vi.mocked(createApplication).mockResolvedValue({
			id: 1,
			name: 'billing',
			description: 'Billing app',
		});
		render(<CreateApplicationForm />);

		const user = await fillForm();
		await user.click(screen.getByRole('button', { name: 'Crear' }));

		await waitFor(() =>
			expect(notifySuccess).toHaveBeenCalledWith('Aplicación "billing" creada correctamente.'),
		);
		expect(createApplication).toHaveBeenCalledWith({
			name: 'billing',
			description: 'Billing app',
		});
		expect(screen.getByLabelText('Nombre')).toHaveValue('');
		expect(screen.getByLabelText('Descripción')).toHaveValue('');
	});

	it('shows the error when creation fails', async () => {
		vi.mocked(createApplication).mockRejectedValue(new Error('Duplicated'));
		render(<CreateApplicationForm />);

		const user = await fillForm();
		await user.click(screen.getByRole('button', { name: 'Crear' }));

		await waitFor(() => expect(notifyError).toHaveBeenCalledWith('Duplicated'));
		expect(notifySuccess).not.toHaveBeenCalled();
	});

	it('validates the maximum length of name and description', async () => {
		render(<CreateApplicationForm />);

		await fillForm('x'.repeat(16), 'y'.repeat(201));

		expect(await screen.findByText('Máximo 15 caracteres.')).toHaveClass('text-danger');
		expect(screen.getByText('Máximo 200 caracteres.')).toHaveClass('text-danger');
		expect(screen.getByRole('button', { name: 'Crear' })).toBeDisabled();
	});

	it('shows a submitting label while the request is pending', async () => {
		let resolveCreate!: (value: Application) => void;
		vi.mocked(createApplication).mockReturnValue(
			new Promise((resolve) => {
				resolveCreate = resolve;
			}),
		);
		render(<CreateApplicationForm />);

		const user = await fillForm();
		await user.click(screen.getByRole('button', { name: 'Crear' }));

		expect(screen.getByRole('button', { name: 'Creando…' })).toBeDisabled();

		resolveCreate({ id: 1, name: 'x', description: 'y' });
		await waitFor(() => expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument());
	});
});
