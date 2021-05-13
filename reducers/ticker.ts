import { ActionType, getType } from 'typesafe-actions';

import * as tickerActions from '../actions/ticker.js';
import * as allSetActions from '../actions/allSet.js';

export interface TickerStateType {
	readonly currentTick: number,
	readonly tickInterval: number,
	readonly tickTime: number,
	readonly running: boolean,
};

export const initialState = {
	currentTick: 0,
	tickInterval: 250,
	tickTime: Date.now(),
	running: false,
};

type TickerAction = ActionType<typeof tickerActions>;
type AllSetAction = ActionType<typeof allSetActions>;

export default (state: TickerStateType = initialState, action: TickerAction | AllSetAction): TickerStateType => {
	switch (action.type) {
		case (getType(allSetActions.set)):
			return action.payload.ticker;
		case (getType(tickerActions.tick)):
			return {
				...state,
				currentTick: state.currentTick + 1,
				tickTime: action.payload.tickTime,
			};
		case (getType(tickerActions.setTickInterval)):
			return {
				...state,
				tickInterval: action.payload,
			};
		case (getType(tickerActions.setRunning)):
			return {
				...state,
				running: action.payload,
			};
		default:
			return state;
	}
};
