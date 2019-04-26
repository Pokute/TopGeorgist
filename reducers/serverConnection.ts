/// <reference path="../typings/ws-wrapper.d.ts" />

// Only from client to server

import { getType, ActionType } from 'typesafe-actions';
import WebSocketWrapper from 'ws-wrapper';

import * as serverConnectionActions from '../actions/serverConnection';

export interface ServerConnectionStateType {
	readonly websocket?: WebSocketWrapper,
	readonly reconnectionDelay: number,
};

const initialState: ServerConnectionStateType = {
	reconnectionDelay: 125,
};

export type ServerConnectionActionType = ActionType<typeof serverConnectionActions>;

export default (state: ServerConnectionStateType = initialState, action: ServerConnectionActionType): ServerConnectionStateType => {
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
