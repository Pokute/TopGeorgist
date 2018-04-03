export const initialState = {
	moveTarget: undefined,
	taskQueue: [],
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'PLAYER_SET_MOVE_TARGET':
			return {
				...state,
				moveTarget: action.position,
			};
		case 'PLAYER_SET_TASK_QUEUE':
			return {
				...state,
				taskQueue: Array.isArray(action.taskQueue) ? action.taskQueue : [action.taskQueue],
			};
		case 'PLAYER_ADD_TASK_QUEUE':
			return {
				...state,
				taskQueue: [
					...state.taskQueue,
					...(Array.isArray(action.taskQueue) ? action.taskQueue : [action.taskQueue]),
				],
			};
		default:
			return state;
	}
};
