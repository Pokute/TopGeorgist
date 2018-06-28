import { createAction } from "typesafe-actions";

export const frame = createAction('FRAME', (resolve) => {
	return () => resolve({
		frameTime: Date.now(),
	});
});
