import { call, fork, put, select, take, takeEvery, all } from 'redux-saga/effects';
import { delay } from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import isServer from '../isServer'
import * as tickerActions from '../actions/ticker';
// import components, { ComponentTicker } from '../data/components';
import { set as allSet } from '../actions/allSet';
import { RootStateType } from '../reducers';
import { TgoType, ComponentId, ComponentProps, ComponentType } from '../reducers/tgo';
import { AnyAction } from 'redux';
// import { hasComponentComponents } from '../data/components_new';

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
	yield all(newActions.map(a => put(a)));

	const newState: RootStateType = yield select();
	const calls = Object.values(newState.clients).map(c => call(
		[c.socket, c.socket.sendAction],
		allSet({
			...newState,
			clients: {},
		}),
	));
	try {
		yield all(calls);
	} catch (ex) {
		console.log(ex);
	}
};

const tickerRootSaga = function* () {
	if (isServer) yield fork(tickerSaga);
	yield takeEvery(getType(tickerActions.tick), tick);
};

export default tickerRootSaga;
