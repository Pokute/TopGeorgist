import { ActionType, getType } from 'typesafe-actions';

import * as taskQueueActions from '../actions/taskQueue';

export interface TaskType {
};

export type TaskQueueType = TaskType[];

export const initialState = [];

export type TaskQueueActionType = ActionType<typeof taskQueueActions>
export const TaskQueueActionList = [
	taskQueueActions.setTaskQueue,
	taskQueueActions.setTaskQueue,
];

export default (state = initialState, action: TaskQueueActionType) => {
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
