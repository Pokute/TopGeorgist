import { createAction } from 'typesafe-actions';

import { ConnectionStateType } from '../reducers/connection';

export const createWebsocket = createAction('CONNECTION_CREATE_WEBSOCKET', (resolve) => {
	return () => resolve({ });
});

export const setWebsocket = createAction('CONNECTION_SET_WEBSOCKET', (resolve) => {
	return (websocket: ConnectionStateType['websocket']) => resolve({
		websocket,
	});
});

export const message = createAction('CONNECTION_MESSAGE', (resolve) => {
	return (message: { data: any, event: MessageEvent }) => resolve(message);
});
