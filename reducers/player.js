const initialState = {
	position: {
		x: 0,
		y: 0,
	},
	color: 'red',
}

export default (state = initialState, action) => {
	switch (action.type) {
		case 'PLAYER_SET_POSITION':
			return {
				...state,
				position: action.position,
			};
		case 'PLAYER_SET_COLOR':
			return {
				...state,
				color: action.color,
			};
		default:
			return state;
	}
};
