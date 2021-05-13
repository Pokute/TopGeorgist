import React, { ReactNode } from 'react';
import { connect } from 'react-redux';

import CurrentPlayerInfo from './currentPlayerInfo.react.js';
import CreatePlayerForm from './createPlayerForm.react.js';
import { TgoId } from '../reducers/tgo.js';
import { RootStateType } from '../reducers.js';
import Category from './Category.js';
// import { RequirementDelivery } from '../concerns/goal.js';
import { MapPosition } from '../reducers/map.js';

export interface propTypes {
	readonly defaultPlayerTgoId?: TgoId,
}

const PlayerContainer = ({defaultPlayerTgoId}: propTypes) => {
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

const mapStoreToProps = (store: RootStateType) => ({
	defaultPlayerTgoId: store.defaults.playerTgoId,
});

export default connect(mapStoreToProps)(PlayerContainer);
