import { put, takeEvery } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as tgoActions from '../actions/tgo';
import * as netActions from '../actions/net';

const sendAction = function* (action) {
	yield put(netActions.send(action));
};

const clientListener = function* () {
	if (global.isServer) return;

	yield takeEvery(
		[
			getType(tgoActions.setMoveTarget),
		],
		sendAction,
	);
};

export default clientListener;
