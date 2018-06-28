import { ActionType, getType } from 'typesafe-actions';

import playerReducer, { initialState as playerInitialState } from './player';
import tgoReducer, { initialState as tgoInitialState, TgoType } from './tgo';
import { add, remove, setAll } from '../actions/tgo'; 

type TgosState = {
	[extraProps: string]: TgoType;
};

const initialState: TgosState = {};
const listActions = [
	// tgoActions.add,
	// tgoActions.remove,
	// tgoActions.setAll,
];

// const reduceByType = (tgo, action) => {
// 	if (!tgo) return undefined;
// 	if (action.type.indexOf('TGO_') === 0) {
// 		return tgoReducer(tgo, action);
// 	} else if (action.type.indexOf('PLAYER_') === 0) {
// 		return playerReducer(tgo, action);
// 	}
// 	return tgo;
// };

type TgosAction = ActionType<typeof add & typeof remove & typeof setAll>;

export default (state: TgosState = initialState, action: TgosAction) => {
	// Handle single tgo changes here.
	// if ((action.tgoId) &&
	// 	(listActions.indexOf(action.type) === -1)) {
	// 	const modifiedTgo = reduceByType(state[action.tgoId], action);
	// 	if (modifiedTgo) {
	// 		return {
	// 			...state,
	// 			[action.tgoId]: modifiedTgo,
	// 		};
	// 	}

	// 	return state;
	// }
	switch (action.type) {
		case getType(tgoActions.add):
			return {
				...state,
				[action.payload.tgo.tgoId]: {
					...(action.payload.tgo.typeId === 'player' ? playerInitialState : {}),
					...tgoInitialState,
					...action.payload.tgo,
				},
			};
		case getType(tgoActions.remove): {
			const { [action.payload.tgoId]: undefined, ...rest } = state;
			return rest;
		}
		case getType(tgoActions.setAll):
			return action.payload.tgos;
		default:
			return state;
	}
};
