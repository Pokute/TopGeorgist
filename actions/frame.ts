import { createAction } from 'typesafe-actions';

export const frame = createAction('FRAME',
	() => ({
		frameTime: Date.now(),
	})
)();
