/// <reference path="../typings/ws-wrapper.d.ts" />
import WebSocketWrapper from 'ws-wrapper';
import { ActionType, getType, Action, createAction } from 'typesafe-actions';
import { eventChannel, END } from 'redux-saga';
import { take as rawTake, takeEvery, put, call, fork, delay } from 'typed-redux-saga';

import isServer from '../isServer.js'
import config from '../config.js';
import * as netActions from '../actions/net.js';
import { select, take } from '../redux-saga-helpers.js';

// Actions:

export const createWebsocket = createAction('CONNECTION_CREATE_WEBSOCKET')();

export const setWebsocket = createAction('CONNECTION_SET_WEBSOCKET',
	(websocket: ServerConnectionStateType['websocket']) => ({
		websocket,
	})
)();

export const message = createAction('CONNECTION_MESSAGE',
	(message: { data: any, event: MessageEvent }) => (message)
)();

export const resetReconnectionDelay = createAction('CONNECTION_DELAY_RESET')();

export const doubleReconnectionDelay = createAction('CONNECTION_DELAY_DOUBLE')();

export const serverConnectionActions = {
	createWebsocket,
	setWebsocket,
	message,
	resetReconnectionDelay,
	doubleReconnectionDelay,
} as const;

type ServerConnectionAction = ActionType<typeof serverConnectionActions>

// Sagas:

const listenCreateWebsocket = function* ({}: ActionType<typeof serverConnectionActions.createWebsocket>) {
	const ws = new WebSocket(`ws://${config.gameServer.host}:${config.gameServer.port}`);
	const clientToServerWS = new WebSocketWrapper(ws);

	const state = yield* select();

	if (state.serverConnection.websocket) {
		// Disconnect old.
		state.serverConnection.websocket.disconnect();
	}

	yield* put(serverConnectionActions.setWebsocket(clientToServerWS));
};

const listenSetWebsocket = function* ({ payload: { websocket }}: ActionType<typeof serverConnectionActions.setWebsocket>) {
	if (!websocket) {
		return null;
	}

	const createConnectionEventChannel = () => eventChannel(emitter => {
		websocket.on('message', ({data, event}: { data: any, event: MessageEvent }) => {
			emitter(serverConnectionActions.message({ data, event }));
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
		yield* put(serverConnectionActions.setWebsocket(undefined));
	}
};

const listenMessage = function* ({ payload: { data: jsonData } }: ActionType<typeof serverConnectionActions.message>) {
	const data = JSON.parse(jsonData);

	yield* put(netActions.receiveMessage(data));
};

const reconnectionSaga = function* () {
	yield* put(serverConnectionActions.createWebsocket());

	while (true) {
		// const wsOrDelayTimeout = yield* race({
		// 	take(getType(connectionActions.setWebsocket)),
		// 	delay(currentDelay);
		// });
		const ws = yield* take(getType(serverConnectionActions.setWebsocket));
		if (ws.payload.websocket) {
			yield* put(serverConnectionActions.resetReconnectionDelay());
		} else {
			yield* put(serverConnectionActions.createWebsocket());
			const currentDelay = (yield* select()).serverConnection.reconnectionDelay;
			yield* delay(currentDelay);
			yield* put(serverConnectionActions.doubleReconnectionDelay());
		}
	}
};

export const serverConnectionSaga = function* () {
	yield* takeEvery(getType(serverConnectionActions.createWebsocket), listenCreateWebsocket);
	yield* takeEvery(getType(serverConnectionActions.setWebsocket), listenSetWebsocket);
	yield* takeEvery(getType(serverConnectionActions.message), listenMessage);
	if (!isServer) {
		yield* fork(reconnectionSaga);
		// yield* put(connectionActions.createWebsocket());
	}
};

// Reducer:

export interface ServerConnectionStateType {
	readonly websocket?: WebSocketWrapper,
	readonly reconnectionDelay: number,
};

export const initialState: ServerConnectionStateType = {
	reconnectionDelay: 125,
};

export type ServerConnectionActionType = ActionType<typeof serverConnectionActions>;

export const serverConnectionReducer = (state: ServerConnectionStateType = initialState, action: ServerConnectionActionType): ServerConnectionStateType => {
	switch (action.type) {
		case getType(serverConnectionActions.setWebsocket):
			return {
				...state,
				websocket: action.payload.websocket
			};
		case getType(serverConnectionActions.resetReconnectionDelay):
			return {
				...state,
				reconnectionDelay: initialState.reconnectionDelay,
			};
		case getType(serverConnectionActions.doubleReconnectionDelay):
			return {
				...state,
				reconnectionDelay: state.reconnectionDelay * 2,
			};
		default:
			return state;
	}
};
