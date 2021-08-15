import { combineReducers, AnyAction, Reducer } from 'redux'
import { getType, ActionType } from 'typesafe-actions';

import { accountListReducer } from '../concerns/account.js';
import serverConnection, { ServerConnectionStateType } from './serverConnection.js';
import clients, { ClientsState } from './clients.js';
import defaults, { Type as DefaultsType } from './defaults.js';
import { frameReducer } from '../concerns/frame.js';
import government, { GovernmentStateType } from './government.js';
import itemTypes, { ItemTypesState } from './itemTypes.js';
import { mapReducer } from '../concerns/map.js';
import tgos, { TgosState } from './tgos.js';
import { tickerReducer } from '../concerns/ticker.js';
import tileSets, { TileSetsState } from './tileSets.js';
import views, { ViewsState } from './views.js';
import { createGoal, addGoals } from '../concerns/goal.js';
import { add as addTgo } from '../actions/tgos.js';

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

const rootReducer: Reducer<RootStateType, AnyAction> = (state: RootStateType | undefined, action: AnyAction) => {
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
