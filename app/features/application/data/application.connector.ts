import type { CreateApplicationPayload } from '@/app/features/application/data/application.dto';
import { requestJson } from '@/app/lib/request-json';

export function fetchApplications(signal?: AbortSignal): Promise<unknown> {
	return requestJson('/api/applications', { signal });
}

export function postApplication(payload: CreateApplicationPayload): Promise<unknown> {
	return requestJson('/api/applications', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
}
