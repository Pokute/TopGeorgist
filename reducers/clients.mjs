import clientReducer from './client';
const initialState = {};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'CLIENT_ADD':
			return {
				...state,
				[action.client.clientId]: action.client,
			};
		case 'CLIENT_REMOVE':
			const {[action.clientId]: undefined, ...rest} = state;
			return rest;
		default:
			return state;
	}
};
