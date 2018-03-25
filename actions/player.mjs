export const playerRequest = (playerLabel) => ({
	type: 'PLAYER_CREATE_REQUEST',
	label: playerLabel,
});

export const setTaskQueue = (taskQueue) => ({
	type: 'PLAYER_SET_TASK_QUEUE',
	taskQueue,
});

export const addTaskQueue = (taskQueue) => ({
	type: 'PLAYER_ADD_TASK_QUEUE',
	taskQueue,
});
