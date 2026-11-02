'use client';

import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import { createApplication } from '@/app/features/application/application.service';
import { notifyError, notifySuccess } from '@/app/lib/notify';

interface CreateApplicationFormValues {
	name: string;
	description: string;
}

export function CreateApplicationForm() {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting, isValid },
	} = useForm<CreateApplicationFormValues>({
		mode: 'onChange',
		defaultValues: { name: '', description: '' },
	});

	const onSubmit = handleSubmit(async (data) => {
		try {
			const created = await createApplication(data);

			notifySuccess(`Aplicación "${created?.name ?? data.name}" creada correctamente.`);
			reset();
		} catch (err) {
			notifyError((err as Error).message);
		}
	});

	return (
		<div style={{ maxWidth: 480 }}>
			<h2 className='h4 mb-4'>Crear aplicación</h2>

			<Form onSubmit={onSubmit}>
				<Form.Group
					className='mb-3'
					controlId='createApplicationName'
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
					className='mb-4'
					controlId='createApplicationDescription'
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
		</div>
	);
}
