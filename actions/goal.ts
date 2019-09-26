import { createAction } from 'typesafe-actions';

import { TgoId } from "../reducers/tgo";

export const addWorkInstance = createAction('GOAL_ADD_WORK_INSTANCE', (resolve) => {
	return (goalTgoId: TgoId, workInstanceTgoId: TgoId) => resolve({
		tgoId: goalTgoId,
		workInstanceTgoId,
	});
});

export const removeWorkInstance = createAction('GOAL_REMOVE_WORK_INSTANCE', (resolve) => {
	return (tgoId: TgoId, workInstanceTgoId: TgoId) => resolve({
		tgoId,
		workInstanceTgoId,
	});
});

export const setWorkTargetTgoId = createAction('GOAL_SET_TARGET_TGO_ID', (resolve) =>
	(tgoId: TgoId, workTargetTgoId: TgoId) => resolve({
		tgoId,
		workTargetTgoId,
	})
);
