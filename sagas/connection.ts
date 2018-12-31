import { ActionType, getType } from 'typesafe-actions';
import { takeEvery, put, select, call, take } from 'redux-saga/effects';
import WebSocketWrapper from 'ws-wrapper';

import config from '../config';
import * as connectionActions from '../actions/connection';
import * as netActions from '../actions/net';
import { RootStateType } from '../reducers';
import { eventChannel, END } from 'redux-saga';

const listenCreateWebsocket = function* ({}: ActionType<typeof connectionActions.createWebsocket>) {
	const ws = new WebSocket(`ws://${config.gameServer.host}:${config.gameServer.port}`);
	const clientToServerWS = new WebSocketWrapper(ws);

	const state: RootStateType = yield select();

	if (state.connection.websocket) {
		// Disconnect old.
		state.connection.websocket.disconnect();
	}

	yield put(connectionActions.setWebsocket(clientToServerWS));
};

const listenSetWebsocket = function* ({ payload: { websocket }}: ActionType<typeof connectionActions.setWebsocket>) {
	if (!websocket) {
		return null;
	}

	const eC = () => eventChannel(emitter => {
		websocket.on('message', ({data, event}: { data: any, event: MessageEvent }) => {
			emitter(connectionActions.message({ data, event }));
		});

		websocket.on('close', () => {
			emitter(END);
		});

		return () => {};
	});

	const c = yield call(eC);

	try {
		while (true) {
			const foo = yield take(c);
			yield put(foo)
		}
	} finally {

	}
};

const listenMessage = function* ({ payload: { data: jsonData } }: ActionType<typeof connectionActions.message>) {
	const data = JSON.parse(jsonData);

	yield put(netActions.receiveMessage(data));
}

const netListener = function* () {
	yield takeEvery(getType(connectionActions.createWebsocket), listenCreateWebsocket);
	yield takeEvery(getType(connectionActions.setWebsocket), listenSetWebsocket);
	yield takeEvery(getType(connectionActions.message), listenMessage);
	if (!global.isServer) {
		yield put(connectionActions.createWebsocket());
	}
};

export default netListener;
