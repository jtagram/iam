/**
 * Transport helper: performs a `fetch` and returns the parsed JSON body as
 * `unknown`. It does NOT check `response.ok`: HTTP error responses carry an
 * envelope that the service layer must read.
 */
export async function requestJson(input: string, init?: RequestInit): Promise<unknown> {
	let response: Response;
	try {
		response = await fetch(input, init);
	} catch (err) {
		throw isAbort(err, init) ? err : new Error('No se pudo conectar con el servidor.');
	}

	try {
		return await response.json();
	} catch (err) {
		if (isAbort(err, init)) {
			throw err;
		}
		throw new Error('El servidor devolvió una respuesta ilegible.');
	}
}

function isAbort(err: unknown, init?: RequestInit): boolean {
	return (
		init?.signal?.aborted === true ||
		(typeof err === 'object' && err !== null && (err as { name?: unknown }).name === 'AbortError')
	);
}
