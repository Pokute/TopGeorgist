import { ActionType, getType } from 'typesafe-actions';

import { ClientId, ClientType, default as clientReducer} from './client';
import * as clientActions from '../actions/client'; 

type ClientsState = {
	[extraProps: string]: ClientType;
};

const initialState: ClientsState = {};
const listActions = [
	clientActions.add,
	clientActions.remove,
].map(a => getType(a));

type ClientsAction = ActionType<typeof clientActions>;

export default (state: ClientsState = initialState, action: ClientsAction) => {
	// if (!listActions.includes(action.type)) {
	// 	const modifiedClient = clientReducer(state[action.clientId], action);
	// 	if (modifiedClient) {
	// 		return {
	// 			...state,
	// 			[action.clientId]: modifiedClient,
	// 		};
	// 	}

	// 	return state;
	// }
	switch (action.type) {
		case getType(clientActions.add):
			return {
				...state,
				[action.payload.client.clientId]: action.payload.client,
			};
		case getType(clientActions.remove): {
			const { [action.payload.clientId]: undefined, ...rest } = state;
			return rest;
		}
		default:
			return state;
	}
};
