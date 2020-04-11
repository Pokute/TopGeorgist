import { combineReducers, AnyAction } from 'redux'
import accounts, { AccountsState } from './accounts';
import serverConnection, { ServerConnectionStateType } from './serverConnection';
import clients, { ClientsState } from './clients';
import defaults, { Type as DefaultsType } from './defaults';
import frame, { FrameStateType } from './frame';
import government, { GovernmentStateType } from './government';
import itemTypes, { ItemTypesState } from './itemTypes';
import map, { MapType } from './map';
import tgos, { TgosState } from './tgos';
import ticker, { TickerStateType } from './ticker';
import tileSets, { TileSetsState } from './tileSets';
import views, { ViewsState } from './views';
import { getType, ActionType } from 'typesafe-actions';
import { createGoal, addGoals } from '../concerns/goal';
import { add as addTgo } from '../actions/tgos';

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
