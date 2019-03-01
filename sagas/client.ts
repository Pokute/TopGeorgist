import { put, takeEvery } from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import * as tgoActions from '../actions/tgo';
import * as netActions from '../actions/net';
import { setGoals } from '../actions/goals';

const sendAction = function* (action: ActionType<typeof tgoActions.setMoveTarget>) {
	yield put(netActions.send(action));
};

const clientListener = function* () {
	if (global.isServer) return;

	yield takeEvery(
		[
			getType(tgoActions.setMoveTarget),
			getType(setGoals),
		],
		sendAction,
	);
};

export default clientListener;
