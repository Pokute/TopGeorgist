import { type AnyAction } from 'redux';

import { type ClientId } from '../reducers/client.ts';

export type WithClient <T extends AnyAction> = T & {
	payload: {
		clientId: ClientId, 
	}
};

export const withClient = <T extends AnyAction>(action: T, clientId: ClientId) => ({
	type: `${action.type}_WITH_CLIENT`,
	payload: {
		...action.payload,
		clientId,
	},
});
