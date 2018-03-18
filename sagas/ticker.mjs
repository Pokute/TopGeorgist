import { call, fork, put, select, takeEvery } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import * as tickerActions from '../actions/ticker';
import components from '../components';

const tickerSaga = function*() {
	while (true) {
		if (!(yield select()).ticker.running)
			while (yield take('SET_TICKER_RUNNING').running == false) {};
		yield put(tickerActions.tick());
		yield delay((yield select()).ticker.tickInterval);
	}
}

const tick = function*() {
	const oldState = yield select();
	const newActions = oldState.tgos
		.filter(tgo => tgo.components)
		.map(tgo => 
			tgo.components
				.map(cId => (typeof cId === 'string')
					? [cId, undefined]
					: cId)
				.map(cId => [components[cId[0]], cId[1]])
				.filter(c => c[0].tick)
				.map(c => c[0].tick(tgo, c[1]))
			)
		.reduce((acc, action) => [...acc, ...action], []) // Flatten one level
		.reduce((acc, action) => [...acc, ...action], []);
	yield newActions.map(a => put(a));
	
	const newState = yield select();
	const calls = newState.clients.map(c => 
		call([c.socket, c.socket.send],
			JSON.stringify({
				action: {
					type: 'ALL_SET',
					data: { ...newState, clients:[] }
				}
			})
		)
	);
	try {
		yield calls;
	} catch (ex) {
		console.log(ex);
	}
}

const tickerRootSaga = function*() {
	if (global.isServer) yield fork(tickerSaga);
	yield takeEvery('TICK', tick);
};

export default tickerRootSaga;
