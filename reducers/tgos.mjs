import playerReducer from './player';
import tgoReducer from './tgo';
const initialState = [];
const listActions = [
	'TGO_ADD',
	'TGO_REMOVE',
]

export default (state = initialState, action) => {
	// Handle single tgo changes here.
	if ((action.tgoId) && 
		(listActions.indexOf(action.type) === -1)) {
		return state.map(p => {
			if (p.tgoId !== action.tgoId)
				return p;
			if (action.type.indexOf('TGO_') === 0)
				return tgoReducer(p, action);
			if (action.type.indexOf('PLAYER_') === 0)
				return playerReducer(p, action);
			return p;
		});
	}
	switch (action.type) {
		case 'TGO_ADD':
			return [
				...state,
				action.tgo,
			];
		case 'TGO_REMOVE':
			return state.filter(tgo => tgo.tgoId !== action.tgoId);
		default:
			return state;
	}
};