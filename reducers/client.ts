import { type AnyAction } from 'redux';

import { type ClientsState } from './clients.ts';

export type ClientId = keyof ClientsState;
export interface extendedSocket extends WebSocket {
	sendAction(action:AnyAction): void,
};

export interface ClientType {
	readonly clientId: ClientId,
	readonly socket: extendedSocket,
}

export default (state: ClientType, action: AnyAction): ClientType => {
	switch (action.type) {
		default:
			return state;
	}
};
