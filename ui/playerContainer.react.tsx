import React, { ReactNode } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';

import CurrentPlayerInfo from './currentPlayerInfo.react.js';
import CreatePlayerForm from './createPlayerForm.react.js';
import { TgoId, TgoType } from '../reducers/tgo.js';
import { RootStateType } from '../reducers/index.js';
import Category from './Category.js';
import { RequirementInventoryItems } from '../concerns/goal.js';
import { ItemType, TypeId } from '../reducers/itemType.js';
import { itemReqGoal } from '../concerns/itemReqGoal.js';
// import { RequirementDelivery } from '../concerns/goal.js';
// import { MapPosition } from '../concerns/map.js';

const PlayerContainer = () => {
	const defaultPlayerTgoId = useSelector<RootStateType, TgoId | undefined>(s => s.defaults.playerTgoId);
	const dispatch = useDispatch();
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
					const tradeReq:RequirementInventoryItems = {
						type: 'RequirementInventoryItems',
						inventoryItems: [{
							typeId: 'trade' as TypeId,
							count: 1,
						}],
					};
					dispatch(itemReqGoal(defaultPlayerTgoId, tradeReq.inventoryItems));
				}}
			>
				Create Trade Inventory Item Goal
			</button>
			)}
		</Category>
	);
};

export default PlayerContainer;
