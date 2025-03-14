import { AnyAction } from 'redux';
import { getType, ActionType, createAction } from 'typesafe-actions';

import { ComponentInventory, hasComponentInventory } from './inventory.js';
import { TypeId } from '../reducers/itemType.js';
import rootReducer, { RootStateType } from '../reducers/index.js';
import { moveGoal } from '../actions/moveGoal.js';
import { ComponentGoal, ComponentGoalDoer, hasComponentGoalDoer, isComponentGoal } from './goal.js';
import { add as addTgo } from './tgos.js';
import { hasComponentPosition, ComponentPosition } from '../components/position.js';
import { TgosState } from '../reducers/tgos.js';
import { MapPosition, mapPosition } from './map.js';
import { createTupleFilter } from './tgos.js';
import { TgoId, TgoType } from '../reducers/tgo.js';
import { count } from 'console';

export const applyMovementReducer = (tgosState: TgosState): TgosState => {
	const goalDoersWithRequirementMoves = Object.entries(tgosState)
		.filter(createTupleFilter(hasComponentGoalDoer))
		.filter(createTupleFilter(hasComponentInventory))
		.filter(createTupleFilter(hasComponentPosition))
		.map<[TgoId, ComponentInventory & ComponentPosition, ComponentGoal?]>(
			([tgoId, tgo]) => [
					tgoId as TgoId,
					tgo,
					(tgo.activeGoals[0] && isComponentGoal(tgosState[tgo.activeGoals[0]]) && tgosState[tgo.activeGoals[0]]) as ComponentGoal | undefined
			])
		.map<[TgoId, ComponentInventory & ComponentPosition, ComponentGoal?, MapPosition?]>(
			([tgoId, tgo, goalTgo]) =>
				[
					tgoId, tgo, goalTgo,
					(goalTgo?.goal.requirements[0]?.type === 'RequirementMove') && goalTgo?.goal.requirements[0]?.targetPosition || undefined
				])
		.filter(
			function (tuple): tuple is [TgoId, Required<ComponentGoalDoer> & Required<ComponentPosition> & Required<ComponentInventory>, ComponentGoal, MapPosition] {
				return (tuple[2] !== undefined) && (tuple[3] !== undefined);
			})
	if (goalDoersWithRequirementMoves.length === 0)
		return tgosState;
	
	const goalDoersWithMovementAmount = goalDoersWithRequirementMoves
		.map<[TgoId, Required<ComponentGoalDoer> & Required<ComponentPosition> & Required<ComponentInventory>, ComponentGoal, MapPosition, ComponentInventory?]>(([tgoId, tgo, goalTgo, targetPosition]) => [
			tgoId, tgo, goalTgo, targetPosition,
			Object.values(goalTgo.workInputCommittedItemsTgoId ?? {})
				.filter(function (committedInventoryTgoId): committedInventoryTgoId is TgoId { return (committedInventoryTgoId !== undefined); })
				.map(committedItemsTgoId => tgosState[committedItemsTgoId])
				.filter(hasComponentInventory)
				.find(
					committedItemsTgo => committedItemsTgo.inventory.some(ii => ii.typeId === 'movementAmount' && ii.count > 0)
				)
		]).filter<[TgoId, Required<ComponentGoalDoer> & Required<ComponentPosition> & Required<ComponentInventory>, ComponentGoal, MapPosition, ComponentInventory]>(
			((tuple): tuple is [TgoId, Required<ComponentGoalDoer> & Required<ComponentPosition> & Required<ComponentInventory>, ComponentGoal, MapPosition, ComponentInventory] => tuple[4] !== undefined)
		);

	const tgosWithAppliedMovement = ({
		...tgosState,
		...Object.fromEntries(goalDoersWithMovementAmount
			.map(([tgoId, tgo, goalTgo, targetPosition]) => [tgoId, ({
				...tgo,
				position: mapPosition.sum(tgo.position, mapPosition.signedTowards(tgo.position, targetPosition!)),
				inventory: tgo.inventory.filter(ii => ii.typeId !== 'movementAmount' as TypeId),
			})]))
	});

	const tgosWithCommittedInventoriesRemoved = ({
		...Object.fromEntries(Object.entries(tgosWithAppliedMovement)
			.filter(([tgoId]) => goalDoersWithMovementAmount.map(([,,,, committedInventory]) => committedInventory.tgoId).includes(tgoId as TgoId) == false)
		),
		...Object.fromEntries(goalDoersWithMovementAmount
			.map(([tgoId, tgo, goalTgo, targetPosition, committedInventory]) => [goalTgo.tgoId, ({
				...goalTgo,
				...(goalTgo.workInputCommittedItemsTgoId
					? { workInputCommittedItemsTgoId: Object.fromEntries(
						Object.entries(goalTgo.workInputCommittedItemsTgoId).filter(([, wiciti]) => wiciti !== committedInventory?.tgoId)
					)}
					: {}
				),
			}) as typeof goalTgo]))
	});

	return tgosWithCommittedInventoriesRemoved;
};

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
					type: 'RequirementMove',
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
