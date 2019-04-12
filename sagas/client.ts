import { put, takeEvery } from 'redux-saga/effects';
import { ActionType, getType } from 'typesafe-actions';

import isServer from '../isServer'
import * as tgoActions from '../actions/tgo';
import * as netActions from '../actions/net';
import { setGoals } from '../actions/goals';
import { moveGoal } from '../actions/moveGoal';

const sendAction = function* (action: ActionType<typeof tgoActions.setMoveTarget>) {
	yield put(netActions.send(action));
};

const clientListener = function* () {
	if (isServer) return;

	// This will send all following actions to the server
	yield takeEvery(
		[
			getType(tgoActions.setMoveTarget),
			getType(setGoals),
			getType(moveGoal),
		],
		sendAction,
	);
};

export default clientListener;
