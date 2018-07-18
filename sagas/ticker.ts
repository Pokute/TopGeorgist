import { call, fork, put, select, take, takeEvery } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { ActionType, getType } from 'typesafe-actions';

import * as tickerActions from '../actions/ticker';
import components from '../components';
import { set as allSet } from '../actions/allSet';
import { RootStateType } from '../reducers';
import { TgoType, ComponentId, ComponentProps, ComponentType } from '../reducers/tgo';
import { resolveCname } from 'dns';
import { AnyAction } from 'redux';

const tickerSaga = function* () {
	while (true) {
		if (!(yield select()).ticker.running) {
			while ((yield take(getType(tickerActions.setRunning))).payload.running === false) ;
		}
		yield put(tickerActions.tick());
		yield delay((yield select()).ticker.tickInterval);
	}
};

const tick = function* () {
	const oldState: RootStateType = yield select();
	type TgoTypeWithComponents = TgoType & {
		components: ReadonlyArray<ComponentType>,
	};
	components['selfMoving'];
	const newActions: AnyAction[] = (Object.values(oldState.tgos)
		.filter(tgo => tgo.components) as TgoTypeWithComponents[])
 		.map(tgo => (tgo.components
			.map(cId => (
				typeof cId === 'string'
					? [cId, undefined]
					: cId
			)) as ReadonlyArray<[ ComponentId, ComponentProps ]>)
			.map(([cName, cProps]) => [components[cName], cProps])
			.filter(c => c[0] && c[0].tick)
			.map(c => c[0].tick(tgo, c[1])),
		)
		.reduce((acc: AnyAction[], action) => [...acc, ...action], []) // Flatten one level
		.reduce((acc: AnyAction[], action) => [...acc, ...action], []);
	yield newActions.map(a => put(a));

	const newState: RootStateType = yield select();
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
	yield takeEvery(getType(tickerActions.tick), tick);
};

export default tickerRootSaga;
