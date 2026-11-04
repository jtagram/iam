import { NextResponse } from 'next/server';

import { getAuthToken } from '@/app/lib/iam-proxy';
import { requireEnv } from '@/app/lib/require-env';

export async function GET() {
	const IAM_API_URL = requireEnv('IAM_API_URL', process.env.IAM_API_URL);
	const { token, unauthorized } = await getAuthToken();
	if (unauthorized) {
		return unauthorized;
	}

	const iamResponse = await fetch(`${IAM_API_URL}/roles/grouped-by-application`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	return new NextResponse(iamResponse.body, {
		status: iamResponse.status,
		headers: { 'Content-Type': iamResponse.headers.get('Content-Type') ?? 'application/json' },
	});
}
