import { ActionType, getType } from 'typesafe-actions';

import * as taskQueueActions from '../actions/taskQueue';

export interface TaskType {
};

export type TaskQueueType = TaskType[];

export const initialState = [];

type TaskQueueAction = ActionType<typeof taskQueueActions>

export default (state = initialState, action: TaskQueueAction) => {
	switch (action.type) {
		case (getType(taskQueueActions.setTaskQueue)):
			return Array.isArray(action.payload.taskQueue) ? action.payload.taskQueue : [action.payload.taskQueue];
		case (getType(taskQueueActions.addTaskQueue)):
			return [
				...state,
				...(Array.isArray(action.payload.taskQueue) ? action.payload.taskQueue : [action.payload.taskQueue]),
			];
		default:
			return state;
	}
};
