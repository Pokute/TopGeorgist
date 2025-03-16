import React from 'react';
import { connect } from 'react-redux';
import ProgressBar from './progressBar.tsx';

import { type RootStateType } from '../reducers/index.ts';
import { type ComponentLabel, hasComponentLabel } from '../components/label.ts';
import { type TgoType } from '../reducers/tgo.ts';
import Inventory from './inventory.react.tsx';
import { hasComponentInventory } from '../concerns/inventory.ts';
import { GoalCreator } from './GoalCreator.tsx';

// const costMapper = (task: TaskType) => {
// 	if (!task.cost) return () => 0;

// 	return (({ cost: { time } }: { cost: { time: number }}) => time);
// };

const CurrentPlayerInfo = ({ player }: ReturnType<typeof mapStoreToProps>) => (player) ? (
	<div>
		{`Player name: ${player.label}`}
		{/* {player.taskQueue
			&& <ProgressBar
				segments={player.taskQueue.map(({ cost, progress }) => ({ cost, progress }))}
				progress={((player.taskQueue.length > 0) && player.taskQueue[0].progress)
					? player.taskQueue[0].progress!.time
					: 0
				}
				costMapping={
					(player.taskQueue.length > 0
						? costMapper(player.taskQueue[0])
						: () => 0
					)
				}
			/>
		} */}
		{hasComponentInventory(player)
			&& <Inventory ownerTgo={player} />
		}
		<GoalCreator goalDoerTgoId={player.tgoId} />
	</div>
)
: null;

const mapStoreToProps = (store: RootStateType) => ({
	player: (store.defaults.playerTgoId && hasComponentLabel(store.tgos[store.defaults.playerTgoId])) ? store.tgos[store.defaults.playerTgoId] as (TgoType & ComponentLabel) : undefined,
});

export default connect(mapStoreToProps)(CurrentPlayerInfo);
