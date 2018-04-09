const initialState = {
	playerTgoId: undefined,
	viewId: undefined,
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'DEFAULTS_SET_PLAYER':
			return {
				...state,
				playerTgoId: action.playerTgoId,
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
