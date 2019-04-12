import { createAction } from 'typesafe-actions';

import { TgoId } from "../reducers/tgo";
import { GoalTgosType } from '../reducers/goals';
import { RequirementMove } from '../reducers/goal';

export const setGoals = createAction('TGO_GOALS_SET', (resolve) => {
	return (tgoId: TgoId, goals: GoalTgosType) => resolve({
		tgoId,
		goals,
	});
});

// export const setMoveGoal = createAction('TGO_GOALS_SET', (resolve) => {
// 	return (tgoId: TgoId, targetPosition: RequirementMove['targetPosition'] ) => setGoals(
// 		tgoId,
// 		[
// 			{
// 				title: 'Moovin!',
// 				progress: 0,
// 				requirements: [
// 					{
// 						type: "RequirementMove",
// 						targetPosition,
// 					},
// 				],
// 			},
// 		],
// 	);
// });

export const addGoals = createAction('TGO_GOALS_ADD', (resolve) => {
	return (tgoId: TgoId, goals: GoalTgosType) => resolve({
		tgoId,
		goals,
	});
});
