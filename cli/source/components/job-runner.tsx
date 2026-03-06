import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { triggerDataLoad, getJobStatus, type DataLoadJob } from '../lib/api.js';

interface JobRunnerProps {
	states: string[];
	onComplete: (results: JobResult[]) => void;
}

export interface JobResult {
	state: string;
	status: 'completed' | 'error';
	locationCount: number;
	cellCount: number;
	durationMs: number | null;
	errorMessage: string | null;
}

const STATUS_LABELS: Record<string, string> = {
	pending: 'Pending...',
	extracting: 'Extracting archive...',
	loading_locations: 'Loading locations...',
	loading_cells: 'Loading cells...',
	completed: 'Completed',
	error: 'Error',
};

export default function JobRunner({ states, onComplete }: JobRunnerProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [job, setJob] = useState<DataLoadJob | null>(null);
	const [results, setResults] = useState<JobResult[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (currentIndex >= states.length) {
			onComplete(results);
			return;
		}

		let polling = true;
		let timeoutId: ReturnType<typeof setTimeout>;

		async function run() {
			const state = states[currentIndex]!;
			try {
				const jobId = await triggerDataLoad(state);

				async function poll() {
					if (!polling) return;
					try {
						const status = await getJobStatus(jobId);
						setJob(status);

						if (status.status === 'completed' || status.status === 'error') {
							const result: JobResult = {
								state,
								status: status.status as 'completed' | 'error',
								locationCount: status.location_count,
								cellCount: status.cell_count,
								durationMs: status.duration_ms,
								errorMessage: status.error_message,
							};
							setResults(prev => [...prev, result]);
							setJob(null);
							setCurrentIndex(prev => prev + 1);
							return;
						}

						timeoutId = setTimeout(poll, 2000);
					} catch (err: any) {
						setError(`Failed to poll job status: ${err.message}`);
					}
				}

				await poll();
			} catch (err: any) {
				const result: JobResult = {
					state,
					status: 'error',
					locationCount: 0,
					cellCount: 0,
					durationMs: null,
					errorMessage: err.message,
				};
				setResults(prev => [...prev, result]);
				setCurrentIndex(prev => prev + 1);
			}
		}

		run();

		return () => {
			polling = false;
			clearTimeout(timeoutId);
		};
	}, [currentIndex]);

	if (error) {
		return (
			<Box>
				<Text color="red">{error}</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold>Loading data ({currentIndex + 1}/{states.length})</Text>
			</Box>

			{/* Completed results */}
			{results.map((result) => (
				<Box key={result.state}>
					<Text color={result.status === 'completed' ? 'green' : 'red'}>
						{result.status === 'completed' ? '  ✓' : '  ✗'}{' '}
						{result.state}
						{result.status === 'completed'
							? ` — ${result.locationCount} locations, ${result.cellCount} cells (${formatDuration(result.durationMs)})`
							: ` — ${result.errorMessage}`}
					</Text>
				</Box>
			))}

			{/* Current job in progress */}
			{job && currentIndex < states.length && (
				<Box>
					<Text color="yellow">
						{'  ⟳ '}{states[currentIndex]}
						{' — '}{STATUS_LABELS[job.status] || job.status}
						{job.location_count > 0 && ` | ${job.location_count} locations`}
						{job.cell_count > 0 && ` | ${job.cell_count} cells`}
					</Text>
				</Box>
			)}

			{/* Pending states */}
			{states.slice(currentIndex + 1).map((state) => (
				<Box key={state}>
					<Text dimColor>{'  ○ '}{state}</Text>
				</Box>
			))}
		</Box>
	);
}

function formatDuration(ms: number | null): string {
	if (ms === null) return '—';
	if (ms < 1000) return `${ms}ms`;
	const seconds = (ms / 1000).toFixed(1);
	return `${seconds}s`;
}
