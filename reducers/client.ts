import { AnyAction } from "redux";

export type ClientId = string;

export interface ClientType {
	readonly clientId: ClientId,
	readonly socket: any,
	readonly playerTgoId: string,
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
