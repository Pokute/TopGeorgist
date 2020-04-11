import { createAction } from 'typesafe-actions';

export const tick = createAction('TICK',
	() => ({
		tickTime: Date.now(),
	})
)();

export const setTickInterval = createAction('SET_TICK_INTERVAL',
	(tickInterval: number) => (tickInterval)
)();

export const setRunning = createAction('SET_TICKER_RUNNING',
	(running: boolean) => (running)
)();
