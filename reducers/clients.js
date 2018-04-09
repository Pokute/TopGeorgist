import clientReducer from './client';

const initialState = {};
const listActions = [
	'CLIENT_ADD',
	'CLIENT_REMOVE',
];

export default (state = initialState, action) => {
	if ((action.clientId) &&
		(listActions.indexOf(action.type) === -1)) {
		const modifiedClient = clientReducer(state[action.clientId], action);
		if (modifiedClient) {
			return {
				...state,
				[action.clientId]: modifiedClient,
			};
		}

		return state;
	}
	switch (action.type) {
		case 'CLIENT_ADD':
			return {
				...state,
				[action.client.clientId]: action.client,
			};
		case 'CLIENT_REMOVE': {
			const { [action.clientId]: undefined, ...rest } = state;
			return rest;
		}
		default:
			return state;
	}
};
