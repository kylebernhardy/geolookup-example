import React, { useState } from 'react';
import { Box, Text, useApp, useInput, useStdout } from 'ink';
import StatePicker from './components/state-picker.js';
import JobRunner, { type JobResult } from './components/job-runner.js';

type Phase = 'picking' | 'loading' | 'done';

export default function App() {
	const { exit } = useApp();
	const { stdout } = useStdout();
	const [phase, setPhase] = useState<Phase>('picking');
	const [selectedStates, setSelectedStates] = useState<string[]>([]);
	const [results, setResults] = useState<JobResult[]>([]);

	useInput((_input, key) => {
		if (key.escape) {
			exit();
		}
		if (key.return && phase === 'done') {
			setResults([]);
			setSelectedStates([]);
			setPhase('picking');
		}
	});

	function handleConfirm(states: string[]) {
		setSelectedStates(states);
		setPhase('loading');
	}

	function handleComplete(jobResults: JobResult[]) {
		setResults(jobResults);
		setPhase('done');
	}

	let content;

	if (phase === 'picking') {
		content = <StatePicker onConfirm={handleConfirm} />;
	} else if (phase === 'loading') {
		content = <JobRunner states={selectedStates} onComplete={handleComplete} />;
	} else {
		const succeeded = results.filter(r => r.status === 'completed');
		const failed = results.filter(r => r.status === 'error');
		const totalLocations = succeeded.reduce((sum, r) => sum + r.locationCount, 0);
		const totalCells = succeeded.reduce((sum, r) => sum + r.cellCount, 0);

		content = (
			<Box flexDirection="column" marginTop={1}>
				<Text bold>Data loading complete</Text>
				<Box marginTop={1}>
					<Text color="green">
						{succeeded.length} succeeded — {totalLocations} locations, {totalCells} cells
					</Text>
				</Box>
				{failed.length > 0 && (
					<Box>
						<Text color="red">{failed.length} failed:</Text>
					</Box>
				)}
				{failed.map(r => (
					<Box key={r.state}>
						<Text color="red">  {r.state}: {r.errorMessage}</Text>
					</Box>
				))}
				<Box marginTop={1}>
					<Text dimColor>Press Enter to load more | Esc to exit</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			padding={1}
			width={stdout.columns}
			height={stdout.rows}
		>
			{content}
		</Box>
	);
}
