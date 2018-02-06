import clientReducer from './client';
const initialState = [];

export default (state = initialState, action) => {
	switch (action.type) {
		case 'CLIENT_ADD':
			return [
				...state,
				action.client,
			];
		case 'CLIENT_REMOVE':
			return state.filter(c => c.clientId !== action.clientId);
		default:
			return state;
	}
};
