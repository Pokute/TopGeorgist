import { call, fork, put, select, take, takeEvery } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import * as tickerActions from '../actions/ticker';
import components from '../components';
import { set as allSet } from '../actions/allSet';

const tickerSaga = function* () {
	while (true) {
		if (!(yield select()).ticker.running) {
			while (yield take('SET_TICKER_RUNNING').running === false) ;
		}
		yield put(tickerActions.tick());
		yield delay((yield select()).ticker.tickInterval);
	}
};

const tick = function* () {
	const oldState = yield select();
	const newActions = Object.values(oldState.tgos)
		.filter(tgo => tgo.components)
		.map(tgo => tgo.components
			.map(cId => (
				typeof cId === 'string'
					? [cId, undefined]
					: cId
			))
			.map(cId => [components[cId[0]], cId[1]])
			.filter(c => c[0] && c[0].tick)
			.map(c => c[0].tick(tgo, c[1])),
		)
		.reduce((acc, action) => [...acc, ...action], []) // Flatten one level
		.reduce((acc, action) => [...acc, ...action], []);
	yield newActions.map(a => put(a));

	const newState = yield select();
	const calls = Object.values(newState.clients).map(c => call(
		[c.socket, c.socket.sendAction],
		allSet({
			...newState,
			clients: {},
		}),
	));
	try {
		yield calls;
	} catch (ex) {
		console.log(ex);
	}
};

const tickerRootSaga = function* () {
	if (global.isServer) yield fork(tickerSaga);
	yield takeEvery('TICK', tick);
};

export default tickerRootSaga;
