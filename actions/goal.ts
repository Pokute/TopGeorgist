import { createAction } from 'typesafe-actions';

import { TgoId } from "../reducers/tgo";

export const addWork = createAction('GOAL_ADD_WORK', (resolve) => {
	return (tgoId: TgoId, workTgoId: TgoId) => resolve({
		tgoId,
		workTgoId,
	});
});

export const removeWork = createAction('GOAL_REMOVE_WORK', (resolve) => {
	return (tgoId: TgoId, workTgoId: TgoId) => resolve({
		tgoId,
		workTgoId,
	});
});

export const setWorkTargetTgoId = createAction('GOAL_SET_TARGET_TGO_ID', (resolve) =>
	(tgoId: TgoId, workTargetTgoId: TgoId) => resolve({
		tgoId,
		workTargetTgoId,
	})
);
