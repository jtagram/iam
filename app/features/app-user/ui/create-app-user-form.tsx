'use client';

import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import type { CreatedAppUser } from '@/app/features/app-user/data/app-user.dto';
import { createAppUser } from '@/app/features/app-user/data/app-user.service';
import { notifyError, notifySuccess } from '@/app/lib/notify';

interface CreateAppUserFormValues {
	name: string;
	description: string;
}

export function CreateAppUserForm() {
	const [created, setCreated] = useState<CreatedAppUser | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting, isValid },
	} = useForm<CreateAppUserFormValues>({
		mode: 'onChange',
		defaultValues: { name: '', description: '' },
	});

	const onSubmit = handleSubmit(async (data) => {
		setCreated(null);

		try {
			const createdAppUser = await createAppUser(data);
			setCreated(createdAppUser);
			notifySuccess(`Usuario "${createdAppUser.name}" creado correctamente.`);
			reset();
		} catch (err) {
			notifyError((err as Error).message);
		}
	});

	return (
		<div style={{ maxWidth: 480 }}>
			<h2 className='h4 mb-4'>Crear usuario de aplicación</h2>

			<Form onSubmit={onSubmit}>
				<Form.Group
					className='mb-3'
					controlId='createAppUserName'
				>
					<Form.Label className='required-label'>Nombre</Form.Label>
					<Form.Control
						type='text'
						aria-required='true'
						{...register('name', {
							required: 'Este campo es obligatorio.',
							maxLength: { value: 30, message: 'Máximo 30 caracteres.' },
						})}
					/>
					{errors.name && <Form.Text className='text-danger'>{errors.name.message}</Form.Text>}
				</Form.Group>

				<Form.Group
					className='mb-4'
					controlId='createAppUserDescription'
				>
					<Form.Label className='required-label'>Descripción</Form.Label>
					<Form.Control
						as='textarea'
						rows={4}
						aria-required='true'
						{...register('description', {
							required: 'Este campo es obligatorio.',
							maxLength: { value: 200, message: 'Máximo 200 caracteres.' },
						})}
					/>
					{errors.description && (
						<Form.Text className='text-danger'>{errors.description.message}</Form.Text>
					)}
				</Form.Group>

				<Button
					type='submit'
					variant='dark'
					disabled={isSubmitting || !isValid}
				>
					{isSubmitting ? 'Creando…' : 'Crear'}
				</Button>
			</Form>

			{created && (
				<Alert
					variant='warning'
					className='mt-4'
				>
					<p className='mb-3'>
						Usuario &quot;{created.name}&quot; creado. Guardá el clienteSecret ahora — no se puede
						volver a obtener.
					</p>

					<Form.Group className='mb-2'>
						<Form.Label className='small mb-1'>clienteId</Form.Label>
						<Form.Control
							type='text'
							readOnly
							value={created.clienteId}
						/>
					</Form.Group>

					<Form.Group>
						<Form.Label className='small mb-1'>clienteSecret</Form.Label>
						<Form.Control
							type='text'
							readOnly
							value={created.clienteSecret}
						/>
					</Form.Group>
				</Alert>
			)}
		</div>
	);
}
