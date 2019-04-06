import React, { ReactNode } from 'react';
import { connect } from 'react-redux';

import CurrentPlayerInfo from './currentPlayerInfo.react';
import CreatePlayerForm from './createPlayerForm.react';
import { TgoId } from '../reducers/tgo';
import { RootStateType } from '../reducers';
import Category from './Category';
import { RequirementDelivery } from '../reducers/goal';

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
					const delivery:RequirementDelivery = {
						tgoIds: [defaultPlayerTgoId],
						targetPosition: {
							x: 20,
							y: 20
						},
						type: "RequirementDelivery",
						inventoryItems: [],
					}
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
