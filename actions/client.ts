import { createAction } from 'typesafe-actions';
import { type ClientId, type ClientType } from '../reducers/client.ts';

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
