import { combineReducers, AnyAction } from 'redux'
import accounts, { AccountsState } from './accounts.js';
import serverConnection, { ServerConnectionStateType } from './serverConnection.js';
import clients, { ClientsState } from './clients.js';
import defaults, { Type as DefaultsType } from './defaults.js';
import frame, { FrameStateType } from './frame.js';
import government, { GovernmentStateType } from './government.js';
import itemTypes, { ItemTypesState } from './itemTypes.js';
import map, { MapType } from './map.js';
import tgos, { TgosState } from './tgos.js';
import ticker, { TickerStateType } from './ticker.js';
import tileSets, { TileSetsState } from './tileSets.js';
import views, { ViewsState } from './views.js';
import { getType, ActionType } from 'typesafe-actions';
import { createGoal, addGoals } from '../concerns/goal.js';
import { add as addTgo } from '../actions/tgos.js';

export interface RootStateType {
	readonly accounts: AccountsState,
	readonly clients: ClientsState,
	readonly defaults: DefaultsType,
	readonly frame: FrameStateType,
	readonly government: GovernmentStateType,
	readonly itemTypes: ItemTypesState,
	readonly map: MapType,
	readonly serverConnection: ServerConnectionStateType,
	readonly tgos: TgosState,
	readonly ticker: TickerStateType,
	readonly tileSets: TileSetsState,
	readonly views: ViewsState,
};

const combinedReducers = combineReducers({
	accounts,
	serverConnection,
	clients,
	defaults,
	frame,
	government,
	itemTypes,
	map,
	tgos,
	ticker,
	tileSets,
	views,
});

const rootReducer = (state: RootStateType | undefined, action: AnyAction) => {
	switch (action.type) {
		case getType(createGoal): {
			const a = action as ActionType<typeof createGoal>;
			const addGoalTgoAction = addTgo({
				goal: a.payload.goal,
			});
			const addedGoalTgoState = combinedReducers(state, addGoalTgoAction);
			if (state === addedGoalTgoState) return state;

			const goalAddedToGoalDoerAction = addGoals(a.payload.tgoId, [addGoalTgoAction.payload.tgo.tgoId]);
			const goalAddedToGoalDoerState = combinedReducers(addedGoalTgoState, goalAddedToGoalDoerAction);
			if (state === goalAddedToGoalDoerState) return state;

			return goalAddedToGoalDoerState;
		}
		default:
			return combinedReducers(state, action);
	}
}

export default rootReducer;
