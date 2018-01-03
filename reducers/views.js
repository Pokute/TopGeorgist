import viewReducer from './view';
const initialState = [];

export default (state = initialState, action) => {
	// Handle single view changes here.
	if ((action.viewId) && 
		(action.type != 'TGO_ADD')) {
		return state.map(v => {
			if (p.viewId !== action.viewId)
				return p;
			if (action.type.indexOf('VIEW_') === 0)
				return tgoReducer(p, action);
			return v;
		});
	}
	switch (action.type) {
		case 'VIEW_ADD':
			return [
				...state,
				action.tgo,
			];
		default:
			return state;
	}
};
