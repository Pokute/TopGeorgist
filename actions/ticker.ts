import { createAction } from 'typesafe-actions';

export const tick = createAction('TICK', (resolve) => {
	return () => resolve({
		tickTime: Date.now(),
	})
});

export const setTickInterval = createAction('SET_TICK_INTERVAL', (resolve) => {
	return (tickInterval: number) => resolve(tickInterval)
});

export const setRunning = createAction('SET_TICKER_RUNNING', (resolve) => {
	return (running: boolean) => resolve(running)
});
