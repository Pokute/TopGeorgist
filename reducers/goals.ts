import { ActionType, getType } from 'typesafe-actions';

import * as goalsActions from '../actions/goals';
import { TgoId } from './tgo';

export type GoalTgosType = ReadonlyArray<TgoId>;

export const initialState: GoalTgosType = [];

export type GoalsActionType = ActionType<typeof goalsActions>
export const GoalsActionList = [
	goalsActions.setGoals,
	goalsActions.addGoals,
];

export default (state: GoalTgosType = initialState, action: GoalsActionType): GoalTgosType => {
	switch (action.type) {
		case (getType(goalsActions.setGoals)):
			console.log('setting goal queue: ',  action.payload)
			return Array.isArray(action.payload.goals) ? action.payload.goals : [action.payload.goals];
		case (getType(goalsActions.addGoals)):
			console.log('adding to goal queue: ',  action.payload)
			return [
				...state,
				...(Array.isArray(action.payload.goals) ? action.payload.goals : [action.payload.goals]),
			];
		case (getType(goalsActions.removeGoals)):
			return state.filter(goal => !action.payload.goals.includes(goal));
		default:
			return state;
	}
};
