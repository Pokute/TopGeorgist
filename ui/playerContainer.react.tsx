import React, { ReactNode } from 'react';
import { connect, useSelector } from 'react-redux';

import CurrentPlayerInfo from './currentPlayerInfo.react.js';
import CreatePlayerForm from './createPlayerForm.react.js';
import { TgoId, TgoType } from '../reducers/tgo.js';
import { RootStateType } from '../reducers/index.js';
import Category from './Category.js';
// import { RequirementDelivery } from '../concerns/goal.js';
// import { MapPosition } from '../concerns/map.js';

const PlayerContainer = () => {
	const defaultPlayerTgoId = useSelector<RootStateType, TgoId | undefined>(s => s.defaults.playerTgoId);
	return (
		<Category
			title={'Player'}
		>
			{defaultPlayerTgoId
				? <CurrentPlayerInfo />
				: <CreatePlayerForm />
			}
			{ defaultPlayerTgoId && (<button
				onClick={() => {
					// const delivery:RequirementDelivery = {
					// 	tgoIds: [defaultPlayerTgoId],
					// 	targetPosition: {
					// 		x: 20,
					// 		y: 20
					// 	} as MapPosition,
					// 	type: "RequirementDelivery",
					// 	inventoryItems: [],
					// }
				}}
			>
				Create Delivery Goal
			</button>
			)}
		</Category>
	);
};

export default PlayerContainer;
