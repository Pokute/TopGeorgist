import { AnyAction } from "redux";

import { ClientId } from "../reducers/client";

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
