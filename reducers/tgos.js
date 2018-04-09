import playerReducer, { initialState as playerInitialState } from './player';
import tgoReducer, { initialState as tgoInitialState } from './tgo';

const initialState = {};
const listActions = [
	'TGO_ADD',
	'TGO_REMOVE',
	'TGOS_SET',
];

const reduceByType = (tgo, action) => {
	if (!tgo) return undefined;
	if (action.type.indexOf('TGO_') === 0) {
		return tgoReducer(tgo, action);
	} else if (action.type.indexOf('PLAYER_') === 0) {
		return playerReducer(tgo, action);
	}
	return tgo;
};

export default (state = initialState, action) => {
	// Handle single tgo changes here.
	if ((action.tgoId) &&
		(listActions.indexOf(action.type) === -1)) {
		const modifiedTgo = reduceByType(state[action.tgoId], action);
		if (modifiedTgo) {
			return {
				...state,
				[action.tgoId]: modifiedTgo,
			};
		}

		return state;
	}
	switch (action.type) {
		case 'TGO_ADD':
			return {
				...state,
				[action.tgo.tgoId]: {
					...(action.tgo.typeId === 'player' ? playerInitialState : {}),
					...tgoInitialState,
					...action.tgo,
				},
			};
		case 'TGO_REMOVE': {
			const { [action.tgoId]: undefined, ...rest } = state;
			return rest;
		}
		case 'TGOS_SET':
			return action.tgosState;
		default:
			return state;
	}
};
