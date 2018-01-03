const initialState = {
	players: [],
}

export default (state = initialState, action) => {
	switch (action.type) {
		case 'ADD_PLAYER':
			return [
				...state,
				action.player,
			];
		default:
			return state;
	}
};
