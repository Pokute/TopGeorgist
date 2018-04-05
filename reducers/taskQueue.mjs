export const initialState = [];

export default (state = initialState, action) => {
	switch (action.type) {
		case 'TGO_TASK_QUEUE_SET':
			return Array.isArray(action.taskQueue) ? action.taskQueue : [action.taskQueue];
		case 'TGO_TASK_QUEUE_ADD':
			return [
				...state,
				...(Array.isArray(action.taskQueue) ? action.taskQueue : [action.taskQueue]),
			];
		default:
			return state;
	}
};
