import { NextResponse } from 'next/server';

import { getAuthToken, invalidIdResponse, isValidId } from '@/app/lib/iam-proxy';
import { requireEnv } from '@/app/lib/require-env';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	const IAM_API_URL = requireEnv('IAM_API_URL', process.env.IAM_API_URL);
	const { token, unauthorized } = await getAuthToken();
	if (unauthorized) {
		return unauthorized;
	}

	const { id } = await params;
	if (!isValidId(id)) {
		return invalidIdResponse();
	}

	const iamResponse = await fetch(`${IAM_API_URL}/apps-users/${id}/connections`, {
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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const IAM_API_URL = requireEnv('IAM_API_URL', process.env.IAM_API_URL);
	const { token, unauthorized } = await getAuthToken();
	if (unauthorized) {
		return unauthorized;
	}

	const { id } = await params;
	if (!isValidId(id)) {
		return invalidIdResponse();
	}

	const iamResponse = await fetch(`${IAM_API_URL}/apps-users/${id}/connections`, {
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
