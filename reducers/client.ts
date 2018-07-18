import { AnyAction } from "redux";
import { ClientsState } from "./clients";
import { TgoId } from "./tgo";

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
