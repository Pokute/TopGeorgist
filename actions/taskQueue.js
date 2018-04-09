export const setTaskQueue = (tgoId, taskQueue) => ({
	type: 'TGO_TASK_QUEUE_SET',
	tgoId,
	taskQueue,
});

export const addTaskQueue = (tgoId, taskQueue) => ({
	type: 'TGO_TASK_QUEUE_ADD',
	tgoId,
	taskQueue,
});
