import { createAction } from 'typesafe-actions';

import { ServerConnectionStateType } from '../reducers/serverConnection';

export const createWebsocket = createAction('CONNECTION_CREATE_WEBSOCKET', (resolve) => {
	return () => resolve({ });
});

export const setWebsocket = createAction('CONNECTION_SET_WEBSOCKET', (resolve) => {
	return (websocket: ServerConnectionStateType['websocket']) => resolve({
		websocket,
	});
});

export const message = createAction('CONNECTION_MESSAGE', (resolve) => {
	return (message: { data: any, event: MessageEvent }) => resolve(message);
});
