import React from 'react';
import { connect } from 'react-redux';
import ProgressBar from './progressBar';

const costMapper = (task) => {
	if (!task.cost) return () => 0;

	return (({ cost: { time } }) => time);
};

const CurrentPlayerInfo = props => (
	<div>
		<ProgressBar
			// progress={(props.currentTick % 160)}
			// segments={[
			// 	{ title: 'Part1', cost: 20, },
			// 	{ title: 'Part2', cost: 100, },
			// 	{ title: 'Part3', cost: 40, },
			// ]}
			segments={props.player.taskQueue}
			progress={(props.player.taskQueue && (props.player.taskQueue.length > 0) && props.player.taskQueue[0].progress)
				? props.player.taskQueue[0].progress.time
				: 0
			}
			costMapping={
				(props.player.taskQueue && (props.player.taskQueue.length > 0)
					? costMapper(props.player.taskQueue[0])
					: () => 0
				)
			}
		/>
		{`Player name: ${props.player.label}`}
	</div>
);

const mapStoreToProps = store => ({
	player: store.tgos[store.defaults.playerTgoId],
});

export default connect(mapStoreToProps)(CurrentPlayerInfo);
