const initialState = {
	moveTarget: undefined,
}

export default (state = initialState, action) => {
	switch (action.type) {
		case 'PLAYER_SET_MOVE_TARGET':
			return {
				...state,
				moveTarget: action.moveTarget,
			};
		default:
			return state;
	}
};
