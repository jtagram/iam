export interface Application {
	id: number;
	name: string;
	description: string;
}

export interface CreateApplicationPayload {
	name: string;
	description: string;
}
