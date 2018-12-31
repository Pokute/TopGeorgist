// Only from client to server

import { getType, ActionType } from 'typesafe-actions';
import WebSocketWrapper from 'ws-wrapper';

import * as serverConnectionActions from '../actions/serverConnection';

export interface ServerConnectionStateType {
	websocket?: WebSocketWrapper,
};

const initialState: ServerConnectionStateType = {
};

export type ServerConnectionActionType = ActionType<typeof serverConnectionActions>;

export default (state: ServerConnectionStateType = initialState, action: ServerConnectionActionType): ServerConnectionStateType => {
	switch (action.type) {
		case getType(serverConnectionActions.setWebsocket):
			return {
				...state,
				websocket: action.payload.websocket
			};
		default:
			return state;
	}
};
