import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { AUTH_COOKIE_NAME } from '@/app/lib/auth-cookie';
import {
	extractErrorMessage,
	type IamErrorBody,
	readIamBody,
	UNREADABLE_IAM_BODY_STATUS,
} from '@/app/lib/iam-proxy';
import { requireEnv } from '@/app/lib/require-env';

interface LoginRequestBody {
	email?: string;
	password?: string;
}

interface IamLoginSuccess {
	access_token: string;
}

export async function POST(request: Request) {
	const IAM_API_URL = requireEnv('IAM_API_URL', process.env.IAM_API_URL);
	const IAM_APPLICATION_NAME = requireEnv('IAM_APPLICATION_NAME', process.env.IAM_APPLICATION_NAME);
	const IAM_TARGET_APPLICATION_NAME = requireEnv(
		'IAM_TARGET_APPLICATION_NAME',
		process.env.IAM_TARGET_APPLICATION_NAME,
	);
	let body: LoginRequestBody;
	try {
		body = (await request.json()) as LoginRequestBody;
	} catch {
		return NextResponse.json({ message: 'Cuerpo de la petición inválido.' }, { status: 400 });
	}

	const { email, password } = body;
	if (!email || !password) {
		return NextResponse.json({ message: 'Correo y contraseña son obligatorios.' }, { status: 400 });
	}

	const iamResponse = await fetch(`${IAM_API_URL}/internal-users/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-origin-application': IAM_APPLICATION_NAME,
			'x-target-application': IAM_TARGET_APPLICATION_NAME,
		},
		body: JSON.stringify({ email, password }),
	});

	const data = await readIamBody<IamLoginSuccess & IamErrorBody>(iamResponse);

	if (!iamResponse.ok) {
		return NextResponse.json(
			{ message: extractErrorMessage(data, 'No se pudo iniciar sesión.') },
			{ status: iamResponse.status },
		);
	}

	if (!data?.access_token) {
		return NextResponse.json(
			{ message: 'No se pudo iniciar sesión.' },
			{ status: UNREADABLE_IAM_BODY_STATUS },
		);
	}

	const cookieStore = await cookies();
	cookieStore.set(AUTH_COOKIE_NAME, data.access_token, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV !== 'development',
		path: '/',
	});

	return NextResponse.json({ ok: true });
}
