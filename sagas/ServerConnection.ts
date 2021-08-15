/// <reference path="../typings/ws-wrapper.d.ts" />

import { ActionType, getType, Action } from 'typesafe-actions';
import { eventChannel, END } from 'redux-saga';
import { take as rawTake, takeEvery, put, call, fork, delay } from 'typed-redux-saga';
import WebSocketWrapper from 'ws-wrapper';

import isServer from '../isServer.js'
import config from '../config.js';
import * as connectionActions from '../actions/serverConnection.js';
import * as netActions from '../actions/net.js';
import { select, take } from '../redux-saga-helpers.js';

const listenCreateWebsocket = function* ({}: ActionType<typeof connectionActions.createWebsocket>) {
	const ws = new WebSocket(`ws://${config.gameServer.host}:${config.gameServer.port}`);
	const clientToServerWS = new WebSocketWrapper(ws);

	const state = yield* select();

	if (state.serverConnection.websocket) {
		// Disconnect old.
		state.serverConnection.websocket.disconnect();
	}

	yield* put(connectionActions.setWebsocket(clientToServerWS));
};

const listenSetWebsocket = function* ({ payload: { websocket }}: ActionType<typeof connectionActions.setWebsocket>) {
	if (!websocket) {
		return null;
	}

	const createConnectionEventChannel = () => eventChannel(emitter => {
		websocket.on('message', ({data, event}: { data: any, event: MessageEvent }) => {
			emitter(connectionActions.message({ data, event }));
		});

		websocket.on('open', () => {
			console.log('Opened conection');
		})

		websocket.on('close', () => {
			emitter(END);
		});

		websocket.on('error', () => {
			emitter(END);
		});

		return () => {};
	});

	const connectionEventChannel = yield* call(createConnectionEventChannel);

	try {
		while (true) {
			const channelAction: Action<any> = yield* rawTake(connectionEventChannel) as any;
			yield* put(channelAction)
		}
	} finally {
		yield* put(connectionActions.setWebsocket(undefined));
	}
};

const listenMessage = function* ({ payload: { data: jsonData } }: ActionType<typeof connectionActions.message>) {
	const data = JSON.parse(jsonData);

	yield* put(netActions.receiveMessage(data));
};

const reconnectionSaga = function* () {
	yield* put(connectionActions.createWebsocket());

	while (true) {
		// const wsOrDelayTimeout = yield* race({
		// 	take(getType(connectionActions.setWebsocket)),
		// 	delay(currentDelay);
		// });
		const ws = yield* take(getType(connectionActions.setWebsocket));
		if (ws.payload.websocket) {
			yield* put(connectionActions.resetReconnectionDelay());
		} else {
			yield* put(connectionActions.createWebsocket());
			const currentDelay = (yield* select()).serverConnection.reconnectionDelay;
			yield* delay(currentDelay);
			yield* put(connectionActions.doubleReconnectionDelay());
		}
	}
};

const serverConnectionListener = function* () {
	yield* takeEvery(getType(connectionActions.createWebsocket), listenCreateWebsocket);
	yield* takeEvery(getType(connectionActions.setWebsocket), listenSetWebsocket);
	yield* takeEvery(getType(connectionActions.message), listenMessage);
	if (!isServer) {
		yield* fork(reconnectionSaga);
		// yield* put(connectionActions.createWebsocket());
	}
};

export default serverConnectionListener;
