import { createAction } from 'typesafe-actions';

import { type TgoId } from '../reducers/tgo.ts';
import { hasComponentInventory, type Inventory } from './inventory.ts';
import rootReducer, { type RootStateType } from '../reducers/index.ts';
import { type TypeId } from '../reducers/itemType.ts';
import { hasComponentGoalDoer } from './goal.ts';
import { add as addTgo } from './tgos.ts';

export const itemReqGoal = createAction('TGO_GOAL_CREATE_ITEM_REQ',
	(ownerTgoId: TgoId, inventory: Inventory) => ({
		tgoId: ownerTgoId,
		inventory,
	})
)();

export const itemReqGoalReducer = (state: RootStateType, action: ReturnType<typeof itemReqGoal>): RootStateType => {
	const {tgoId: itemRequesterTgoId, inventory} = action.payload;
	const itemRequesterTgo = state.tgos[itemRequesterTgoId];
	if (!hasComponentGoalDoer(itemRequesterTgo) || !hasComponentInventory(itemRequesterTgo)) {
		console.error(`Tried to add itemReq Goal for ${itemRequesterTgoId} but it either has not goaldoer or no inventory`);
		return state;
	}

	const goalTgo = addTgo({
		goal: {
			title: 'Get items',
			requirements: [
				{
					type: 'RequirementAcquireInventoryItems',
					inventoryItems: inventory,
				},
			],
		},
		worksIssued: [],
		workInputCommittedItemsTgoId: {},
	});
	const goalTgoId = goalTgo.payload.tgo.tgoId;
	const stateWithGoalTgo = rootReducer(state, goalTgo);
	// Add the tgoId to player inventory
	// Add the tgoId to active goals.
	return {
		...stateWithGoalTgo,
		tgos: {
			...stateWithGoalTgo.tgos,
			[itemRequesterTgoId]: {
				...itemRequesterTgo,
				inventory: [
					...itemRequesterTgo.inventory,
					{
						typeId: 'tgoId' as TypeId,
						tgoId: goalTgoId,
						count: 1,
					}
				],
				activeGoals: [
					...itemRequesterTgo.activeGoals,
					goalTgoId,
				],
			},
		},
	};
}
