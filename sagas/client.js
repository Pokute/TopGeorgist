import { put, takeEvery } from 'redux-saga/effects';
import * as netActions from '../actions/net';

const sendAction = function* (action) {
	yield put(netActions.send(action));
};

const clientListener = function* () {
	if (global.isServer) return;

	yield takeEvery(
		[
			'PLAYER_SET_MOVE_TARGET',
		],
		sendAction,
	);
};

export default clientListener;
