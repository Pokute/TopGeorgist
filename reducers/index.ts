import { combineReducers, AnyAction, Reducer } from 'redux'
import { getType, ActionType } from 'typesafe-actions';

import { accountListReducer } from '../concerns/account.js';
import { serverConnectionReducer, ServerConnectionStateType } from '../concerns/clientToServerConnection.js';
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
import { cancelWork, createWork, workCancelReducer, workCreatorReducer, workDoersTickReducer } from '../concerns/work.js';
import { moveGoal } from '../actions/moveGoal.js';
import { ComponentInventory, hasComponentInventory, InventoryItem } from '../concerns/inventory.js';
import { TypeId } from './itemType.js';
import { createTupleFilter } from '../concerns/tgos.js';
import { ComponentPosition, hasComponentPosition } from '../components/position.js';
import { payRent, payRentReducer } from '../concerns/rentOffice.js';
import { collect, collectReducer, deployTgo, deployTgoReducer, deployType, deployTypeReducer } from '../concerns/deployable.js';
import { applyMovementReducer, moveGoalReducer } from '../concerns/movement.js';

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
	serverConnection: serverConnectionReducer,
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
		case getType(cancelWork): {
			return {
				...state,
				tgos: workCancelReducer(state.tgos, state.itemTypes, action),
			};
		}
		case getType(tick): {
			const afterWorkTgosState = workDoersTickReducer(state.tgos, state.itemTypes);

			const afterGoalTgosState = goalDoersTickReducer(afterWorkTgosState, state.itemTypes);

			const afterApplyMovementTgosState = applyMovementReducer(afterGoalTgosState);

			if (afterApplyMovementTgosState === state.tgos) return state;

			return {
				...state,
				tgos: afterApplyMovementTgosState,
			};
		}

		case getType(moveGoal):
			return moveGoalReducer(state, action);
		case getType(payRent):
			return payRentReducer(state, action);
		case getType(deployType):
			return deployTypeReducer(state, action);
		case getType(deployTgo):
			return deployTgoReducer(state, action);
		case getType(collect):
			return collectReducer(state, action);
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
