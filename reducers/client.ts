import { AnyAction } from 'redux';
import { ClientsState } from './clients.js';
import { TgoId } from './tgo.js';

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
