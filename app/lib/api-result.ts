/** Envelope used by every IAM response (success or error): `{ ok, msg, data }`. */
export type ApiResult<T> =
	{ ok: true; msg: string; data: T } | { ok: false; msg: string; data: null };

/** Builds a failed envelope. */
export function failure(msg: string): { ok: false; msg: string; data: null } {
	return { ok: false, msg, data: null };
}

/**
 * Parses a response body as an `ApiResult`. A body that is not JSON or does
 * not have the envelope shape becomes a failed result with `fallback`.
 */
export async function readApiResult<T>(
	response: Response,
	fallback: string,
): Promise<ApiResult<T>> {
	const body: unknown = await response.json().catch(() => null);

	if (!isEnvelope(body)) {
		return failure(fallback);
	}

	if (body.ok) {
		return { ok: true, msg: body.msg, data: body.data as T };
	}

	return failure(body.msg || fallback);
}

function isEnvelope(body: unknown): body is { ok: boolean; msg: string; data: unknown } {
	if (typeof body !== 'object' || body === null || Array.isArray(body)) {
		return false;
	}
	const candidate = body as Record<string, unknown>;
	return (
		typeof candidate.ok === 'boolean' && typeof candidate.msg === 'string' && 'data' in candidate
	);
}
