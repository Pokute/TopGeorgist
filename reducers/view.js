const initialState = {
	viewId: undefined,
	position: {
		x: 0,
		y: 0,
	},
	size: {
		x: 100,
		y: 100,
	},
}

export default (state = initialState, action) => {
	switch (action.type) {
		case 'VIEW_SET_POSITION':
			return {
				...state,
				position: action.position,
			};
		case 'VIEW_SET_SIZE':
			return {
				...state,
				view: action.view,
			};
		default:
			return state;
	}
};
