import { createAction } from 'typesafe-actions';

import { TgoId } from "../reducers/tgo";
import { TaskQueueType } from '../reducers/taskQueue';

export const setTaskQueue = createAction('TGO_TASK_QUEUE_SET', (resolve) => {
	return (tgoId: TgoId, taskQueue: TaskQueueType) => resolve({
		tgoId,
		taskQueue,
	});
});

export const addTaskQueue = createAction('TGO_TASK_QUEUE_ADD', (resolve) => {
	return (tgoId: TgoId, taskQueue: TaskQueueType) => resolve({
		tgoId,
		taskQueue,
	});
});
