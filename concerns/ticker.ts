import { createAction, ActionType, getType } from 'typesafe-actions';
import { AnyAction } from 'redux';
import { call, delay, fork, put, takeEvery, all } from 'typed-redux-saga';

import * as allSetActions from '../actions/allSet.js';
import isServer from '../isServer.js'
import { set as allSet } from '../actions/allSet.js';
import { select, take } from '../redux-saga-helpers.js';

// Actions:

export const tick = createAction('TICK',
	() => ({
		tickTime: Date.now(),
	})
)();

export const setTickInterval = createAction('SET_TICK_INTERVAL',
	(tickInterval: number) => (tickInterval)
)();

export const setRunning = createAction('SET_TICKER_RUNNING',
	(running: boolean) => (running)
)();

export const tickerActions = {
	tick,
	setTickInterval,
	setRunning,
} as const;

type TickerAction = ActionType<typeof tickerActions>

// Sagas:

const tickerSaga = function* () {
	while (true) {
		if (!(yield* select()).ticker.running) {
			while ((yield* take(getType(setRunning))).payload === false) ;
		}
		yield* put(tick());
		yield* delay((yield* select()).ticker.tickInterval);
	}
};

const tickSaga = function* () {
	const oldState = yield* select();

	const newActions: ReadonlyArray<AnyAction> = [];
	// const newActions: ReadonlyArray<AnyAction> = Object.values<TgoType>(oldState.tgos)
	// 	.filter(hasComponentComponents);
	// 	.map(tgo => tgo.components
	// 		.map<[ComponentId, typeof components[0] | undefined]>(cId => 
	// 			Array.isArray(cId)
	// 				? cId
	// 				: [cId, undefined]
	// 		)
	// 		.map(([cName, cProps]) => [components[cName], cProps])
	// 		.filter(([component]) => component && hasComponentTicker(component))
	// 		.map(([component, componentProps]) => (component as ComponentTicker).tick(tgo, componentProps))
	// 		.filter(actions => actions?.length > 0) as ReadonlyArray<ReadonlyArray<AnyAction>>
	// 	)
	// 	.reduce((acc: ReadonlyArray<ReadonlyArray<AnyAction>>, action) => [...acc, ...action], []) // Flatten one level
	// 	.reduce((acc: ReadonlyArray<AnyAction>, action) => [...acc, ...action], []);
	yield* all(newActions.map(a => put(a)));

	const newState = yield* select();
	const calls = Object.values(newState.clients).map(c => call(
		[c.socket, c.socket.sendAction],
		allSet({
			...newState,
			clients: {},
		}),
	));
	try {
		yield* all(calls);
	} catch (ex) {
		console.log(ex);
	}
};

export const tickerRootSaga = function* () {
	if (isServer) yield* fork(tickerSaga);
	yield* takeEvery(getType(tick), tickSaga);
};

// Reducer:

interface TickerStateType {
	readonly currentTick: number,
	readonly tickInterval: number,
	readonly tickTime: number,
	readonly running: boolean,
};

const initialState = {
	currentTick: 0,
	tickInterval: 250,
	tickTime: Date.now(),
	running: false,
};

type AllSetAction = ActionType<typeof allSetActions>;

export const tickerReducer = (state: TickerStateType = initialState, action: TickerAction | AllSetAction): TickerStateType => {
	switch (action.type) {
		case (getType(allSetActions.set)):
			return action.payload.ticker;
		case (getType(tick)):
			return {
				...state,
				currentTick: state.currentTick + 1,
				tickTime: action.payload.tickTime,
			};
		case (getType(setTickInterval)):
			return {
				...state,
				tickInterval: action.payload,
			};
		case (getType(setRunning)):
			return {
				...state,
				running: action.payload,
			};
		default:
			return state;
	}
};
