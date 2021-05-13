import { createAction } from 'typesafe-actions';

import { TgoId } from '../reducers/tgo.js';
import { TaskQueueType } from '../reducers/taskQueue.js';

export const setTaskQueue = createAction('TGO_TASK_QUEUE_SET',
	(tgoId: TgoId, taskQueue: TaskQueueType) => ({
		tgoId,
		taskQueue,
	})
)();

export const addTaskQueue = createAction('TGO_TASK_QUEUE_ADD',
	(tgoId: TgoId, taskQueue: TaskQueueType) => ({
		tgoId,
		taskQueue,
	})
)();
