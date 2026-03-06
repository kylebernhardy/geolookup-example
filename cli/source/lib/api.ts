const HARPER_URL = process.env['HARPER_URL'] || 'http://localhost:9926';
const HARPER_DATA_ENDPOINT = process.env['HARPER_DATA_ENDPOINT'] || 'data';
const HARPER_USERNAME = process.env['HARPER_USERNAME'] || '';
const HARPER_PASSWORD = process.env['HARPER_PASSWORD'] || '';

function getAuthHeaders(): Record<string, string> {
	if (!HARPER_USERNAME || !HARPER_PASSWORD) return {};
	const encoded = Buffer.from(`${HARPER_USERNAME}:${HARPER_PASSWORD}`).toString('base64');
	return { Authorization: `Basic ${encoded}` };
}

export interface DataLoadJob {
	id: string;
	state: string;
	status: string;
	error_message: string | null;
	location_count: number;
	cell_count: number;
	started_at: string;
	completed_at: string | null;
	duration_ms: number | null;
}

/**
 * Triggers a data load for the given state.
 * @returns The job ID
 */
export async function triggerDataLoad(state: string): Promise<string> {
	const url = `${HARPER_URL}/${HARPER_DATA_ENDPOINT}?state=${encodeURIComponent(state)}`;
	const response = await fetch(url, { headers: getAuthHeaders() });
	const data = await response.json() as any;

	if (data.error) {
		throw new Error(data.error);
	}

	return data.jobId;
}

/**
 * Polls the DataLoadJob endpoint for the given job ID.
 * @returns The current job status
 */
export async function getJobStatus(jobId: string): Promise<DataLoadJob> {
	const url = `${HARPER_URL}/DataLoadJob/${jobId}`;
	const response = await fetch(url, { headers: getAuthHeaders() });
	const data = await response.json() as DataLoadJob;
	return data;
}
