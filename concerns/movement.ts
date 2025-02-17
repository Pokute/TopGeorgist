import { AnyAction } from 'redux';
import { getType, ActionType, createAction } from 'typesafe-actions';

import { ComponentInventory, hasComponentInventory, InventoryItem } from './inventory.js';
import { TypeId } from '../reducers/itemType.js';
import rootReducer, { RootStateType } from '../reducers/index.js';
import { moveGoal } from '../actions/moveGoal.js';
import { hasComponentGoalDoer } from './goal.js';
import { add as addTgo } from '../actions/tgos.js';
import { hasComponentPosition, ComponentPosition } from '../components/position.js';
import { TgosState } from '../reducers/tgos.js';
import { MapPosition, mapPosition } from './map.js';
import { createTupleFilter } from './tgos.js';

export const applyMovementReducer = (tgosState: TgosState) =>
	({
		...tgosState,
		...Object.fromEntries(
			Object.entries(tgosState)
			.filter(createTupleFilter(hasComponentGoalDoer))
			.filter(createTupleFilter(hasComponentInventory))
			.filter(createTupleFilter(hasComponentPosition))
			.map<[string, ComponentInventory & ComponentPosition, InventoryItem?, MapPosition?]>(
				([tgoId, tgo]) => [
						tgoId,
						tgo,
						tgo.inventory.find(ii => ii.typeId === 'movementAmount' as TypeId),
						(() => {
							const goal = tgo.activeGoals[0] && tgosState[tgo.activeGoals[0]]?.goal?.requirements[0];
							if (goal?.type === 'RequirementMove') {
								return goal.targetPosition;
							}

							return undefined;
						})(),
				]
			)
			.filter(([tgoId, tgo, movementAmountInventoryItem, targetPosition]) =>
				(movementAmountInventoryItem?.count ?? 0) > 0 && targetPosition !== undefined)
			.map(([tgoId, tgo, movementAmount, targetPosition]) => [tgoId, ({
				...tgo,
				position: mapPosition.sum(tgo.position, mapPosition.signedTowards(tgo.position, targetPosition!)),
				inventory: tgo.inventory.filter(ii => ii.typeId !== 'movementAmount' as TypeId),
			})])
		),
	});

export const moveGoalReducer = (state: RootStateType, action: ReturnType<typeof moveGoal>): RootStateType => {
	const {tgoId: moverTgoId, position: targetPosition} = action.payload;
	const moverTgo = state.tgos[moverTgoId];
	if (!hasComponentGoalDoer(moverTgo) || !hasComponentInventory(moverTgo)) {
		console.error(`Tried to move ${moverTgoId} but it either has not goaldoer or no inventory`);
		return state;
	}

	const goalTgo = addTgo({
		goal: {
			title: 'Move to position',
			requirements: [
				{
					type: "RequirementMove",
					targetPosition,
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
			[moverTgoId]: {
				...moverTgo,
				inventory: [
					...moverTgo.inventory,
					{
						typeId: 'tgoId' as TypeId,
						tgoId: goalTgoId,
						count: 1,
					}
				],
				activeGoals: [
					...moverTgo.activeGoals,
					goalTgoId,
				],
			},
		},
	};
}
