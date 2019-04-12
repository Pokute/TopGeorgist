import { createAction } from 'typesafe-actions';

import { TgoId } from "../reducers/tgo";

export const addWorkInstance = createAction('GOAL_ADD_WORK_INSTANCE', (resolve) => {
	return (tgoId: TgoId, workInstance: TgoId) => resolve({
		tgoId,
		workInstance,
	});
});

export const removeWorkInstance = createAction('GOAL_REMOVE_WORK_INSTANCE', (resolve) => {
	return (tgoId: TgoId, workInstance: TgoId) => resolve({
		tgoId,
		workInstance,
	});
});
