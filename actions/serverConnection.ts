import { createAction, ActionType } from 'typesafe-actions';

import { ServerConnectionStateType } from '../reducers/serverConnection.js';

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
