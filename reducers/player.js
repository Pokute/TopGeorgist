const initialState = {
	moveTarget: undefined,
	money: 10,
	calories: 1000,
}

export default (state = initialState, action) => {
	switch (action.type) {
		case 'PLAYER_SET_MOVE_TARGET':
			return {
				...state,
				moveTarget: action.moveTarget,
			};
		case 'PLAYER_ADD_CALORIES':
			return {
				...state,
				calories: Math.max(0, state.calories + action.dCalories),
			};
		default:
			return state;
	}
};
