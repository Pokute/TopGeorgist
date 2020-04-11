import { createAction } from 'typesafe-actions';

import { TgoId } from "../reducers/tgo";
import { TaskQueueType } from '../reducers/taskQueue';

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
