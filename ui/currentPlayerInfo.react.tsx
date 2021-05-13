import React from 'react';
import { connect } from 'react-redux';
import ProgressBar from './progressBar.js';
import { RootStateType } from '../reducers.js';
import { TaskType } from '../reducers/taskQueue.js';
import { ComponentLabel, hasComponentLabel } from '../components/label.js';
import { TgoType } from '../reducers/tgo.js';

const costMapper = (task: TaskType) => {
	if (!task.cost) return () => 0;

	return (({ cost: { time } }: { cost: { time: number }}) => time);
};

const CurrentPlayerInfo = (props: ReturnType<typeof mapStoreToProps>) => (props.player && props.player.taskQueue) ? (
	<div>
		<ProgressBar
			// progress={(props.currentTick % 160)}
			// segments={[
			// 	{ title: 'Part1', cost: 20, },
			// 	{ title: 'Part2', cost: 100, },
			// 	{ title: 'Part3', cost: 40, },
			// ]}
			segments={props.player.taskQueue.map(({ cost, progress }) => ({ cost, progress }))}
			progress={((props.player.taskQueue.length > 0) && props.player.taskQueue[0].progress)
				? props.player.taskQueue[0].progress!.time
				: 0
			}
			costMapping={
				(props.player.taskQueue.length > 0
					? costMapper(props.player.taskQueue[0])
					: () => 0
				)
			}
		/>
		{`Player name: ${props.player.label}`}
	</div>
)
: null;

const mapStoreToProps = (store: RootStateType) => ({
	player: (store.defaults.playerTgoId && hasComponentLabel(store.tgos[store.defaults.playerTgoId])) ? store.tgos[store.defaults.playerTgoId] as (TgoType & ComponentLabel) : undefined,
});

export default connect(mapStoreToProps)(CurrentPlayerInfo);
