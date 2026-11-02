'use client';

import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import { createInternalUser } from '@/app/features/internal-user/internal-user.service';
import { notifyError, notifySuccess } from '@/app/lib/notify';

interface CreateInternalUserFormValues {
	name: string;
	lastname: string;
	email: string;
	password: string;
}

export function CreateInternalUserForm() {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting, isValid },
	} = useForm<CreateInternalUserFormValues>({
		mode: 'onChange',
		defaultValues: { name: '', lastname: '', email: '', password: '' },
	});

	const onSubmit = handleSubmit(async (data) => {
		try {
			const created = await createInternalUser(data);

			notifySuccess(
				`Usuario interno "${created.name ?? data.name} ${
					created.lastname ?? data.lastname
				}" creado correctamente.`,
			);
			reset();
		} catch (err) {
			notifyError((err as Error).message);
		}
	});

	return (
		<div style={{ maxWidth: 480 }}>
			<h2 className='h4 mb-4'>Crear usuario interno</h2>

			<Form onSubmit={onSubmit}>
				<Form.Group
					className='mb-3'
					controlId='createInternalUserName'
				>
					<Form.Label className='required-label'>Nombre</Form.Label>
					<Form.Control
						type='text'
						aria-required='true'
						{...register('name', {
							required: 'Este campo es obligatorio.',
							maxLength: { value: 15, message: 'Máximo 15 caracteres.' },
						})}
					/>
					{errors.name && <Form.Text className='text-danger'>{errors.name.message}</Form.Text>}
				</Form.Group>

				<Form.Group
					className='mb-3'
					controlId='createInternalUserLastname'
				>
					<Form.Label className='required-label'>Apellido</Form.Label>
					<Form.Control
						type='text'
						aria-required='true'
						{...register('lastname', {
							required: 'Este campo es obligatorio.',
							maxLength: { value: 15, message: 'Máximo 15 caracteres.' },
						})}
					/>
					{errors.lastname && (
						<Form.Text className='text-danger'>{errors.lastname.message}</Form.Text>
					)}
				</Form.Group>

				<Form.Group
					className='mb-3'
					controlId='createInternalUserEmail'
				>
					<Form.Label className='required-label'>Correo electrónico</Form.Label>
					<Form.Control
						type='email'
						aria-required='true'
						autoComplete='off'
						{...register('email', {
							required: 'Este campo es obligatorio.',
							maxLength: { value: 30, message: 'Máximo 30 caracteres.' },
						})}
					/>
					{errors.email && <Form.Text className='text-danger'>{errors.email.message}</Form.Text>}
				</Form.Group>

				<Form.Group
					className='mb-4'
					controlId='createInternalUserPassword'
				>
					<Form.Label className='required-label'>Contraseña</Form.Label>
					<Form.Control
						type='password'
						aria-required='true'
						autoComplete='new-password'
						{...register('password', {
							required: 'Este campo es obligatorio.',
							minLength: {
								value: 8,
								message: 'Debe tener al menos 8 caracteres.',
							},
							maxLength: {
								value: 72,
								message: 'No puede superar los 72 caracteres.',
							},
						})}
					/>
					{errors.password && (
						<Form.Text className='text-danger'>{errors.password.message}</Form.Text>
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
		</div>
	);
}
