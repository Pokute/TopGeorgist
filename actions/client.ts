import { createAction } from 'typesafe-actions';
import { ClientId, ClientType } from '../reducers/client';

// export const _add = (client: ClientType) => ({
// 	type: 'CLIENT_ADD',
// 	client,
// });

// export const _remove = (clientId: ClientType) => ({
// 	type: 'CLIENT_REMOVE',
// 	clientId,
// });

export const add = createAction('CLIENT_ADD', (resolve) => {
	return (client: ClientType) => resolve({
		client,
	});
});

export const remove = createAction('CLIENT_REMOVE', (resolve) => {
	return (clientId: ClientId) => resolve({
		clientId,
	});
});
