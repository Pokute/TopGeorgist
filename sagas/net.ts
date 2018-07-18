import { ActionType, getType } from 'typesafe-actions';
import { takeEvery } from 'redux-saga/effects';

import * as netActions from '../actions/net';

const netSend = function* (action: ActionType<typeof netActions.send>): IterableIterator<never> {
	// const sSocket = yield select().server.socket;
	const sSocket = global.ws;
	sSocket.send(JSON.stringify({ action: action.payload.sendAction }));
};

const netListener = function* () {
	yield takeEvery(getType(netActions.send), netSend);
};

export default netListener;
