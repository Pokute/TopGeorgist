import { createAction } from 'typesafe-actions';

import { TgoId } from "../reducers/tgo";
import { GoalTgosType } from '../reducers/goals';

export const setGoals = createAction('TGO_GOALS_SET', (resolve) => {
	return (tgoId: TgoId, goals: GoalTgosType) => resolve({
		tgoId,
		goals,
	});
});

export const addGoals = createAction('TGO_GOALS_ADD', (resolve) => {
	return (tgoId: TgoId, goals: GoalTgosType) => resolve({
		tgoId,
		goals,
	});
});

export const removeGoals = createAction('TGO_GOALS_REMOVE', (resolve) => {
	return (tgoId: TgoId, goals: GoalTgosType) => resolve({
		tgoId,
		goals,
	})
});
