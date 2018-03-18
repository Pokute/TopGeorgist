const initialState = {
	currentTick: undefined,
	tickInterval: 250,
	running: true,
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'TICK':
			return {
				...state,
				currentTick: state.currentTick + 1,
			};
		case 'SET_TICK_INTERVAL':
			return {
				...state,
				tickInterval: action.tickInterval,
			};
		case 'SET_TICKER_RUNNING':
			return {
				...state,
				running,
			}
		default:
			return state;
	}
};
