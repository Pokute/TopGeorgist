const initialState = {
	tgoId: undefined,
	position: {
		x: 0,
		y: 0,
	},
	color: 'red',
}

export default (state = initialState, action) => {
	switch (action.type) {
		case 'TGO_SET_POSITION':
			return {
				...state,
				position: action.position,
			};
		case 'TGO_SET_COLOR':
			return {
				...state,
				color: action.color,
			};
		default:
			return state;
	}
};
