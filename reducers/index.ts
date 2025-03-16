import { combineReducers, type AnyAction, type Reducer } from 'redux'
import { getType, type ActionType } from 'typesafe-actions';

import { accountListReducer } from '../concerns/account.ts';
import { serverConnectionReducer, type ServerConnectionStateType } from '../concerns/clientToServerConnection.ts';
import clients, { type ClientsState } from './clients.ts';
import defaults, { type Type as DefaultsType } from './defaults.ts';
import { frameReducer } from '../concerns/frame.ts';
import government, { type GovernmentStateType } from './government.ts';
import itemTypes, { type ItemTypesState } from './itemTypes.ts';
import { mapReducer } from '../concerns/map.ts';
import { tgosReducer, type TgosState } from '../concerns/tgos.ts';
import { tick, tickerReducer } from '../concerns/ticker.ts';
import tileSets, { type TileSetsState } from './tileSets.ts';
import views, { type ViewsState } from './views.ts';
import { cancelGoal, goalCancelReducer, goalDoersTickReducer } from '../concerns/goal.ts';
import { transaction, transactionReducer } from '../concerns/transaction.ts';
import { type AllActions } from '../allActions.ts';
import { cancelWork, createWork, pauseWork, resumeWork, workCancelReducer, workCreatorReducer, workDoersTickReducer, workPauseReducer, workResumeReducer } from '../concerns/work.ts';
import { moveGoal } from '../actions/moveGoal.ts';
import { payRent, payRentReducer } from '../concerns/rentOffice.ts';
import { collect, collectReducer, deployTgo, deployTgoReducer, deployType, deployTypeReducer } from '../concerns/deployable.ts';
import { applyMovementReducer, moveGoalReducer } from '../concerns/movement.ts';
import { itemReqGoal, itemReqGoalReducer } from '../concerns/itemReqGoal.ts';
import { itemKeepMinGoal, itemKeepMinGoalReducer } from '../concerns/itemKeepMinGoal.ts';
import { consumerActions, consumeReducer } from '../concerns/consumer.ts';

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
	tgos: tgosReducer,
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
		case getType(pauseWork): {
			return {
				...state,
				tgos: workPauseReducer(state.tgos, action),
			};
		}
		case getType(resumeWork): {
			return {
				...state,
				tgos: workResumeReducer(state.tgos, action),
			};
		}
		case getType(cancelGoal): {
			return {
				...state,
				tgos: goalCancelReducer(state.tgos, action),
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
		case getType(itemReqGoal):
			return itemReqGoalReducer(state, action);
		case getType(itemKeepMinGoal):
			return itemKeepMinGoalReducer(state, action);
		case getType(payRent):
			return payRentReducer(state, action);
		case getType(deployType):
			return deployTypeReducer(state, action);
		case getType(deployTgo):
			return deployTgoReducer(state, action);
		case getType(collect):
			return collectReducer(state, action);
		case getType(consumerActions.consume):
			return consumeReducer(state, action);
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
