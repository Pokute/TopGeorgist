import { createAction } from 'typesafe-actions';

import { TgoId } from '../reducers/tgo.js';
import { hasComponentInventory, Inventory } from './inventory.js';
import rootReducer, { RootStateType } from '../reducers/index.js';
import { TypeId } from '../reducers/itemType.js';
import { hasComponentGoalDoer } from './goal.js';
import { add as addTgo } from '../actions/tgos.js';

export const itemKeepMinGoal = createAction('TGO_GOAL_CREATE_ITEM_KEEP_MIN_REQ',
	(ownerTgoId: TgoId, inventory: Inventory, completeOnMinimumReached: boolean) => ({
		tgoId: ownerTgoId,
		inventory,
		completeOnMinimumReached
	})
)();

export const itemKeepMinGoalReducer = (state: RootStateType, action: ReturnType<typeof itemKeepMinGoal>): RootStateType => {
	const {tgoId: itemKeepMinRequesterTgoId, inventory, completeOnMinimumReached} = action.payload;
	const itemKeepMinRequesterTgo = state.tgos[itemKeepMinRequesterTgoId];
	if (!hasComponentGoalDoer(itemKeepMinRequesterTgo) || !hasComponentInventory(itemKeepMinRequesterTgo)) {
		console.error(`Tried to add itemKeepMin Goal for ${itemKeepMinRequesterTgo} but it either has not goaldoer or no inventory`);
		return state;
	}

	const goalTgo = addTgo({
		goal: {
			title: 'Get minimum of items',
			requirements: [
				{
					type: 'RequirementKeepMinimumInventoryItems',
					inventoryItems: inventory,
					completeOnMinimumReached
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
			[itemKeepMinRequesterTgoId]: {
				...itemKeepMinRequesterTgo,
				inventory: [
					...itemKeepMinRequesterTgo.inventory,
					{
						typeId: 'tgoId' as TypeId,
						tgoId: goalTgoId,
						count: 1,
					}
				],
				activeGoals: [
					...itemKeepMinRequesterTgo.activeGoals,
					goalTgoId,
				],
			},
		},
	};
}
