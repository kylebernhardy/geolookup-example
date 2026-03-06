import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { ALL_REGIONS, STATES } from '../lib/states.js';

interface StatePickerProps {
	onConfirm: (selected: string[]) => void;
}

export default function StatePicker({ onConfirm }: StatePickerProps) {
	const [cursor, setCursor] = useState(0);
	const [selected, setSelected] = useState<Set<number>>(new Set());

	useInput((input, key) => {
		if (key.upArrow) {
			setCursor(prev => (prev > 0 ? prev - 1 : ALL_REGIONS.length - 1));
		} else if (key.downArrow) {
			setCursor(prev => (prev < ALL_REGIONS.length - 1 ? prev + 1 : 0));
		} else if (input === ' ') {
			setSelected(prev => {
				const next = new Set(prev);
				if (next.has(cursor)) {
					next.delete(cursor);
				} else {
					next.add(cursor);
				}
				return next;
			});
		} else if (input === 'a') {
			// Toggle all
			if (selected.size === ALL_REGIONS.length) {
				setSelected(new Set());
			} else {
				setSelected(new Set(ALL_REGIONS.map((_, i) => i)));
			}
		} else if (key.return) {
			if (selected.size > 0) {
				onConfirm(Array.from(selected).sort((a, b) => a - b).map(i => ALL_REGIONS[i]!));
			}
		}
	});

	// Show a scrolling window of 10 items around the cursor
	const windowSize = 10;
	const half = Math.floor(windowSize / 2);
	let start = Math.max(0, cursor - half);
	const end = Math.min(ALL_REGIONS.length, start + windowSize);
	if (end - start < windowSize) {
		start = Math.max(0, end - windowSize);
	}
	const visible = ALL_REGIONS.slice(start, end);

	return (
		<Box flexDirection="column">
			<Box marginBottom={1} flexDirection="column">
				<Text bold>Geolookup Data Loader</Text>
				<Text>
					This tool loads geographic data into your Harper instance for reverse
					geocoding. Select the states and territories you want to load. Each
					selection will be processed sequentially — the tool will extract the
					data, load locations and cells into the database, and show progress
					in real time.
				</Text>
			</Box>
			<Box marginBottom={1}>
				<Text dimColor>
					{'  '}Up/Down: scroll | Space: toggle | A: toggle all | Enter: confirm | Esc: exit
				</Text>
			</Box>
			{visible.map((region, i) => {
				const realIndex = start + i;
				const isCursor = realIndex === cursor;
				const isSelected = selected.has(realIndex);
				const isTerritoryHeader = realIndex === STATES.length && start <= STATES.length;
				return (
					<React.Fragment key={region}>
						{isTerritoryHeader && realIndex === start + i && (
							<Box marginTop={1}>
								<Text bold dimColor>  Territories</Text>
							</Box>
						)}
						<Box>
							<Text color={isCursor ? 'cyan' : undefined}>
								{isCursor ? '>' : ' '} {isSelected ? '[x]' : '[ ]'} {region}
							</Text>
						</Box>
					</React.Fragment>
				);
			})}
			<Box marginTop={1}>
				<Text dimColor>
					{selected.size} selected | Showing {start + 1}-{end} of {ALL_REGIONS.length}
				</Text>
			</Box>
		</Box>
	);
}
