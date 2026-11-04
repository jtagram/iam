import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { failure } from '@/app/lib/api-result';
import { AUTH_COOKIE_NAME } from '@/app/lib/auth-cookie';

/** Status returned when IAM answers successfully but its body is not valid JSON. */
export const UNREADABLE_IAM_BODY_STATUS = 502;

export type AuthResult =
	{ token: string; unauthorized?: undefined } | { token?: undefined; unauthorized: NextResponse };

/** Reads the session token from the cookie, or builds the 401 response. */
export async function getAuthToken(): Promise<AuthResult> {
	const cookieStore = await cookies();
	const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

	if (!token) {
		return {
			unauthorized: NextResponse.json(failure('No autenticado.'), { status: 401 }),
		};
	}

	return { token };
}

/** IAM ids are integers (`ParseIntPipe` / `PrimaryGeneratedColumn` in iam-api). */
export function isValidId(id: string): boolean {
	return /^\d+$/.test(id);
}

export function invalidIdResponse(label = 'usuario'): NextResponse {
	return NextResponse.json(failure(`El identificador de ${label} es inválido.`), { status: 400 });
}
