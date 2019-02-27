import { ActionType, getType } from 'typesafe-actions';

import * as taskQueueActions from '../actions/taskQueue';
import { AnyAction } from 'redux';

export type TaskCost = {
	time?: number,
	[additionalCostItems: string]: any
};

export type TaskType = {
	title?: string,
	cost?: TaskCost,
	progress?: TaskCost,
	completionAction?: AnyAction,
	advanceActions?: AnyAction[],
};

export const checkTaskCompletion = (task: TaskType): boolean => {
	if (!task.cost) return true;
	if (!task.progress) {
		return false;
	} else {
		return (Object.keys(task.cost).every(
			costItem => task.cost
				&& task.progress
				&& task.progress[costItem]
				&& (task.progress[costItem] >= task.cost[costItem])
		));
	}
};

export type TaskQueueType = ReadonlyArray<TaskType>;

export const initialState = [];

export type TaskQueueActionType = ActionType<typeof taskQueueActions>
export const TaskQueueActionList = [
	taskQueueActions.setTaskQueue,
	taskQueueActions.setTaskQueue,
];

export default (state: TaskQueueType = initialState, action: TaskQueueActionType): TaskQueueType => {
	switch (action.type) {
		case (getType(taskQueueActions.setTaskQueue)):
			console.log('setting task queue: ',  action.payload)
		return Array.isArray(action.payload.taskQueue) ? action.payload.taskQueue : [action.payload.taskQueue];
		case (getType(taskQueueActions.addTaskQueue)):
			console.log('adding to task queue: ',  action.payload)
			return [
				...state,
				...(Array.isArray(action.payload.taskQueue) ? action.payload.taskQueue : [action.payload.taskQueue]),
			];
		default:
			return state;
	}
};
