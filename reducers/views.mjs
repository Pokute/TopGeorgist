import viewReducer from './view';
const initialState = {};

export default (state = initialState, action) => {
	// Handle single view changes here.
	if ((action.viewId) && 
		(action.type !== 'VIEW_ADD') &&
		(action.type !== 'DEFAULTS_SET_VIEW')) {
		return {
			...state,
			[action.viewId]: (action.type.indexOf('VIEW_') === 0)
				? viewReducer(state[action.viewId], action)
				: state[action.viewId]
		};
	}
	switch (action.type) {
		case 'VIEW_ADD':
			return {
				...state,
				[action.view.viewId]: action.view,
			};
		default:
			return state;
	}
};
