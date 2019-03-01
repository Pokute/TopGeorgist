import { ActionType, getType } from 'typesafe-actions';

import * as goalsActions from '../actions/goals';
import { Goal } from './goal';

export type GoalsType = ReadonlyArray<Goal>;

export const initialState: GoalsType = [];

export type GoalsActionType = ActionType<typeof goalsActions>
export const GoalsActionList = [
	goalsActions.setGoals,
	goalsActions.addGoals,
];

export default (state: GoalsType = initialState, action: GoalsActionType): GoalsType => {
	switch (action.type) {
		case (getType(goalsActions.setGoals)):
			debugger;
			console.log('setting task queue: ',  action.payload)
			return Array.isArray(action.payload.goals) ? action.payload.goals : [action.payload.goals];
		case (getType(goalsActions.addGoals)):
			console.log('adding to task queue: ',  action.payload)
			return [
				...state,
				...(Array.isArray(action.payload.goals) ? action.payload.goals : [action.payload.goals]),
			];
		default:
			return state;
	}
};
