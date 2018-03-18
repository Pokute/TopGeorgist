export const tick = () => ({
	type: 'TICK',
});

export const setTickInterval = tickInterval => ({
	type: 'SET_TICK_INTERVAL',
	tickInterval,
});

export const setRunning = running => ({
	type: 'SET_TICKER_RUNNING',
	running,
});
