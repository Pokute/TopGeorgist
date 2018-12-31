// Only from client to server

import { getType, ActionType } from 'typesafe-actions';
import WebSocketWrapper from 'ws-wrapper';

import * as connectionActions from '../actions/connection';

export interface ConnectionStateType {
	websocket?: WebSocketWrapper,
};

const initialState: ConnectionStateType = {
};

export type ConnectionActionType = ActionType<typeof connectionActions>;

export default (state: ConnectionStateType = initialState, action: ConnectionActionType): ConnectionStateType => {
	switch (action.type) {
		case getType(connectionActions.setWebsocket):
			return {
				...state,
				websocket: action.payload.websocket
			};
		default:
			return state;
	}
};
