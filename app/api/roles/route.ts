import { NextResponse } from 'next/server';

import { failure } from '@/app/lib/api-result';
import { getAuthToken } from '@/app/lib/iam-proxy';
import { requireEnv } from '@/app/lib/require-env';

export async function GET(request: Request) {
	const IAM_API_URL = requireEnv('IAM_API_URL', process.env.IAM_API_URL);
	const { token, unauthorized } = await getAuthToken();
	if (unauthorized) {
		return unauthorized;
	}

	const applicationId = new URL(request.url).searchParams.get('applicationId');
	if (!applicationId) {
		return NextResponse.json(failure('applicationId es obligatorio.'), { status: 400 });
	}

	const iamResponse = await fetch(
		`${IAM_API_URL}/roles?applicationId=${encodeURIComponent(applicationId)}`,
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	return new NextResponse(iamResponse.body, {
		status: iamResponse.status,
		headers: { 'Content-Type': iamResponse.headers.get('Content-Type') ?? 'application/json' },
	});
}

export async function POST(request: Request) {
	const IAM_API_URL = requireEnv('IAM_API_URL', process.env.IAM_API_URL);
	const { token, unauthorized } = await getAuthToken();
	if (unauthorized) {
		return unauthorized;
	}

	const iamResponse = await fetch(`${IAM_API_URL}/roles`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: await request.text(),
	});

	return new NextResponse(iamResponse.body, {
		status: iamResponse.status,
		headers: { 'Content-Type': iamResponse.headers.get('Content-Type') ?? 'application/json' },
	});
}
