import type { Application } from '@/app/features/application/data/application.dto';

/** Checks that a parsed body has the envelope shape; `data` is left unchecked. */
export function isResponseBody(body: unknown): body is { ok: boolean; msg: string; data: unknown } {
	if (typeof body !== 'object' || body === null || Array.isArray(body)) {
		return false;
	}
	const candidate = body as Record<string, unknown>;
	return (
		typeof candidate.ok === 'boolean' && typeof candidate.msg === 'string' && 'data' in candidate
	);
}

export function isApplicationResponse(value: unknown): value is Application {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return false;
	}
	const candidate = value as Record<string, unknown>;
	return (
		typeof candidate.id === 'number' &&
		typeof candidate.name === 'string' &&
		typeof candidate.description === 'string'
	);
}

export function isApplicationListResponse(value: unknown): value is Application[] {
	return Array.isArray(value) && value.every(isApplicationResponse);
}
