import viewReducer from './view';
const initialState = [];

export default (state = initialState, action) => {
	// Handle single view changes here.
	if ((action.viewId) && 
		(action.type !== 'VIEW_ADD') &&
		(action.type !== 'DEFAULTS_SET_VIEW')) {
		return state.map(v => {
			if (v.viewId !== action.viewId)
				return v;
			if (action.type.indexOf('VIEW_') === 0)
				return tgoReducer(v, action);
			return v;
		});
	}
	switch (action.type) {
		case 'VIEW_ADD':
			return [
				...state,
				action.view,
			];
		default:
			return state;
	}
};
