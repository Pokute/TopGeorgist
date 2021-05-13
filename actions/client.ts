import { createAction } from 'typesafe-actions';
import { ClientId, ClientType } from '../reducers/client.js';

export const add = createAction('CLIENT_ADD',
	(client: ClientType) => ({
		client,
	})
)();

export const remove = createAction('CLIENT_REMOVE',
	(clientId: ClientId) => ({
		clientId,
	})
)();
