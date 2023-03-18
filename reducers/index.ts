import { combineReducers, AnyAction, Reducer } from 'redux'
import { getType, ActionType } from 'typesafe-actions';

import { accountListReducer } from '../concerns/account.js';
import serverConnection, { ServerConnectionStateType } from './serverConnection.js';
import clients, { ClientsState } from './clients.js';
import defaults, { Type as DefaultsType } from './defaults.js';
import { frameReducer } from '../concerns/frame.js';
import government, { GovernmentStateType } from './government.js';
import itemTypes, { ItemTypesState } from './itemTypes.js';
import { mapPosition, MapPosition, mapReducer } from '../concerns/map.js';
import tgos, { TgosState } from './tgos.js';
import { tick, tickerReducer } from '../concerns/ticker.js';
import tileSets, { TileSetsState } from './tileSets.js';
import views, { ViewsState } from './views.js';
import { createGoal, addGoals, hasComponentGoalDoer, goalDoersTickReducer } from '../concerns/goal.js';
import { add as addTgo } from '../actions/tgos.js';
import { transaction, transactionReducer } from '../concerns/transaction.js';
import { AllActions } from '../allActions.js';
import { createWork, workCreatorReducer, workDoersTickReducer } from '../concerns/work.js';
import { moveGoal } from '../actions/moveGoal.js';
import { ComponentInventory, hasComponentInventory, InventoryItem } from '../concerns/inventory.js';
import { TypeId } from './itemType.js';
import { createTupleFilter } from '../concerns/tgos.js';
import { ComponentPosition, hasComponentPosition } from '../components/position.js';

export interface RootStateType {
	readonly accounts: ReturnType<typeof accountListReducer>,
	readonly clients: ClientsState,
	readonly defaults: DefaultsType,
	readonly frame: ReturnType<typeof frameReducer>,
	readonly government: GovernmentStateType,
	readonly itemTypes: ItemTypesState,
	readonly map: ReturnType<typeof mapReducer>,
	readonly serverConnection: ServerConnectionStateType,
	readonly tgos: TgosState,
	readonly ticker: ReturnType<typeof tickerReducer>,
	readonly tileSets: TileSetsState,
	readonly views: ViewsState,
};

const combinedReducers = combineReducers({
	accounts: accountListReducer,
	serverConnection,
	clients,
	defaults,
	frame: frameReducer,
	government,
	itemTypes,
	map: mapReducer,
	tgos,
	ticker: tickerReducer,
	tileSets,
	views,
});

const applyMovement = (tgosState: TgosState) =>
	({
		...tgosState,
		...Object.fromEntries(
			Object.entries(tgosState)
			.filter(createTupleFilter(hasComponentInventory))
			.filter(createTupleFilter(hasComponentPosition))
			.filter(createTupleFilter(hasComponentGoalDoer))
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

function bigReducers(state: RootStateType, action: AllActions) {
	switch (action.type) {
		case getType(transaction): {
			const newTgosState = transactionReducer(state.tgos, state.itemTypes, action);
			if (newTgosState === state.tgos) return state;

			return {
				...state,
				tgos: newTgosState,
			};
		}
		case getType(createWork): {
			const [afterCreateWorkTgosState, error] = workCreatorReducer(state.tgos, action);
			if (afterCreateWorkTgosState === state.tgos) {
				if (error) {
					console.error(error);
				}
				return state;
			}

			return {
				...state,
				tgos: afterCreateWorkTgosState,
			};
		}
		case getType(tick): {
			const afterWorkTgosState = workDoersTickReducer(state.tgos, state.itemTypes);

			const afterGoalTgosState = goalDoersTickReducer(afterWorkTgosState, state.itemTypes);

			const afterApplyMovementTgosState = applyMovement(afterGoalTgosState);

			if (afterApplyMovementTgosState === state.tgos) return state;

			return {
				...state,
				tgos: afterApplyMovementTgosState,
			};
		}

		case getType(moveGoal): {
			const {tgoId: moverTgoId, position: targetPosition} = action.payload;
			const moverTgo = state.tgos[moverTgoId];
			if (!hasComponentGoalDoer(moverTgo) || !hasComponentInventory(moverTgo)) {
				console.error(`Tried to move ${moverTgoId} but it either has not goaldoer or no inventory`);
				return state;
			}

			const goalTgo = addTgo({
				goal: {
					title: 'Move to position',
					workTgoIds: [],
					requirements: [
						{
							type: "RequirementMove",
							targetPosition,
						},
					],
				}
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
		default: return state
	}
}

const rootReducer: Reducer<RootStateType, AnyAction> = (state: RootStateType | undefined, action: AnyAction) => {
	const intermediateState = combinedReducers(state, action);
	const finalState = bigReducers(intermediateState, action);
	return finalState;
}

const oldRootReducer: Reducer<RootStateType, AnyAction> = (state: RootStateType | undefined, action: AnyAction) => {
	if (!state) {
		return combinedReducers(state, action)
	}
	switch (action.type) {
		// case getType(createGoal): {
		// 	const a = action as ActionType<typeof createGoal>;
		// 	const addGoalTgoAction = addTgo({
		// 		goal: a.payload.goal,
		// 	});
		// 	const addedGoalTgoState = combinedReducers(state, addGoalTgoAction);
		// 	if (state === addedGoalTgoState) return state;

		// 	const goalAddedToGoalDoerAction = addGoals(a.payload.tgoId, [addGoalTgoAction.payload.tgo.tgoId]);
		// 	const goalAddedToGoalDoerState = combinedReducers(addedGoalTgoState, goalAddedToGoalDoerAction);
		// 	if (state === goalAddedToGoalDoerState) return state;

		// 	return goalAddedToGoalDoerState;
		// }
		default:
			return combinedReducers(state, action);
	}
}

export default rootReducer;
