const initialState = {
	currentTick: 0,
	tickInterval: 250,
	running: true,
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'ALL_SET':
			return action.data.ticker;
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
