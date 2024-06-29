/// <reference path="../typings/ws-wrapper.d.ts" />
import WebSocketWrapper from 'ws-wrapper';
import { ActionType, getType, Action, createAction } from 'typesafe-actions';
import { eventChannel, END } from 'redux-saga';
import { take as rawTake, takeEvery, put, call, fork, delay, race } from 'typed-redux-saga';

import isServer from '../isServer.js'
import config from '../config.js';
import * as netActions from './infra/net.js';
import { select, take } from '../redux-saga-helpers.js';

const connectionTimeout = 5000;
const maxRetryTimeout = 30000;

// Actions:

export const connect = createAction('CONNECTION_CONNECT')();

export const message = createAction('CONNECTION_MESSAGE',
	(message: { data: any, event: MessageEvent }) => (message)
)();

export const resetReconnectionDelay = createAction('CONNECTION_DELAY_RESET')();

export const doubleReconnectionDelay = createAction('CONNECTION_DELAY_DOUBLE')();

export const setConnected = createAction('CONNECTION_SET_CONNECTED',
	(websocket: ServerConnectionStateType['websocket']) => ({
		websocket,
	})
)();

export const setDisconnected = createAction('CONNECTION_SET_DISCONNECTED')();

export const serverConnectionActions = {
	connect,
	message,
	resetReconnectionDelay,
	doubleReconnectionDelay,
	setConnected,
	setDisconnected,
} as const;

type ServerConnectionAction = ActionType<typeof serverConnectionActions>

// Sagas:

const listenConnect = function* ({}: ActionType<typeof serverConnectionActions.connect>) {
	const state = yield* select();
	if (state.serverConnection.websocket) {
		state.serverConnection.websocket.disconnect();
	}

	const protocol = config.gameServer.protocol;
	const host = config.gameServer.host;
	const port = config.gameServer.port;
	const ws = new WebSocket(`${protocol}://${host}:${port}`);
	const clientToServerWS = new WebSocketWrapper(ws);

	if (!clientToServerWS)
		return false;

	const timeout = setTimeout(() => {
		clientToServerWS.disconnect();
	}, connectionTimeout);

	const createConnectionEventChannel = (wsw: WebSocketWrapper) => { return eventChannel(emitter => {
		wsw.on('message', ({data, event}: { data: any, event: MessageEvent }) => {
			emitter(serverConnectionActions.message({ data, event }));
		});

		wsw.on('open', (event) => {
			clearTimeout(timeout);
			emitter(serverConnectionActions.setConnected(wsw));
		});

		wsw.on('close', (event) => {
			clearTimeout(timeout);
			emitter(serverConnectionActions.setDisconnected());
			emitter(END);
		});

		wsw.on('error', (event) => {
			clearTimeout(timeout);
			emitter(serverConnectionActions.setDisconnected());
			emitter(END);
		});

		return () => {wsw.disconnect()};
	}); }

	const connectionEventChannel = yield* call(createConnectionEventChannel, clientToServerWS);

	// This code is required to reroute all the eventChannel messages into redux actions.
	try {
		while (true) {
			const channelAction: Action<any> = yield* rawTake(connectionEventChannel) as any;
			yield* put(channelAction)
		}
	} finally {
		yield* put(serverConnectionActions.setDisconnected());
		connectionEventChannel.close();
	}
};

const listenMessage = function* ({ payload: { data: jsonData } }: ActionType<typeof serverConnectionActions.message>) {
	const data = JSON.parse(jsonData);

	yield* put(netActions.receiveMessage(data));
};

const reconnectionSaga = function* () {
	while (true) {
		yield* put(serverConnectionActions.connect());
		const wsOrTimeout = yield* race({
			connected: take(getType(serverConnectionActions.setConnected)),
			timedOut: take(getType(serverConnectionActions.setDisconnected)),
		});

		if (wsOrTimeout.connected) {
			yield* take(getType(serverConnectionActions.setDisconnected)); // Wait until we lose connection
		} else {
			// timeOut
			const currentDelay = (yield* select()).serverConnection.reconnectionDelay;
			yield* delay(currentDelay);
			yield* put(serverConnectionActions.doubleReconnectionDelay());
		}
		yield* delay(2500);
	}
};

export const serverConnectionSaga = function* () {
	yield* takeEvery(getType(serverConnectionActions.connect), listenConnect);
	yield* takeEvery(getType(serverConnectionActions.message), listenMessage);
	if (!isServer) {
		yield* fork(reconnectionSaga);
	}
};

// Reducer:

export interface ServerConnectionStateType {
	readonly websocket?: WebSocketWrapper,
	readonly connected: boolean,
	readonly reconnectionDelay: number,
};

export const initialState: ServerConnectionStateType = {
	connected: false,
	reconnectionDelay: 125,
};

export type ServerConnectionActionType = ActionType<typeof serverConnectionActions>;

export const serverConnectionReducer = (state: ServerConnectionStateType = initialState, action: ServerConnectionActionType): ServerConnectionStateType => {
	switch (action.type) {
		case getType(serverConnectionActions.resetReconnectionDelay):
			return {
				...state,
				reconnectionDelay: initialState.reconnectionDelay,
			};
		case getType(serverConnectionActions.doubleReconnectionDelay):
			return {
				...state,
				reconnectionDelay: Math.min(maxRetryTimeout, state.reconnectionDelay * 2),
			};
		case getType(serverConnectionActions.setDisconnected):
			return {
				...state,
				websocket: undefined,
				connected: false,
			};
		case getType(serverConnectionActions.setConnected):
			return {
				...state,
				websocket: action.payload.websocket,
				connected: true,
				reconnectionDelay: initialState.reconnectionDelay,
			};
		default:
			return state;
	}
};
