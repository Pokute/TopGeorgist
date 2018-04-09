const initialState = {
	current: 0,
	frameTime: Date.now(),
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'FRAME':
			return {
				...state,
				current: state.current + 1,
				frameTime: action.frameTime,
			};
		default:
			return state;
	}
};
