const initialState = {
	playerId: undefined,
	viewId: undefined,
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'DEFAULTS_SET_PLAYER':
			return {
				...state,
				playerId: action.tgoId,
			};
		case 'DEFAULTS_SET_VIEW':
			return {
				...state,
				viewId: action.viewId,
			};
		default:
			return state;
	}
};
