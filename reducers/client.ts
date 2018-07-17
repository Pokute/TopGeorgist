import { AnyAction } from "redux";
import { ClientsState } from "./clients";
import { TgoId } from "./tgo";

export type ClientId = keyof ClientsState;

export interface ClientType {
	readonly clientId: ClientId,
	readonly socket: any,
	readonly playerTgoId: TgoId,
}

const initialState: ClientType = {
	clientId: '',
	socket: undefined,
	playerTgoId: '',
};

export default (state: ClientType = initialState, action: AnyAction): ClientType => {
	switch (action.type) {
		default:
			return state;
	}
};
