export const playerRequest = (playerLabel) => ({
	type: 'PLAYER_CREATE_REQUEST',
	label: playerLabel,
});

export const setTaskQueue = (tgoId, taskQueue) => ({
	type: 'PLAYER_SET_TASK_QUEUE',
	tgoId,
	taskQueue,
});

export const addTaskQueue = (tgoId, taskQueue) => ({
	type: 'PLAYER_ADD_TASK_QUEUE',
	tgoId,
	taskQueue,
});
