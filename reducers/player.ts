import { ActionType, getType } from 'typesafe-actions';

import * as playerActions from '../actions/player'

export const initialState = {
	moveTarget: undefined,
};

export type PlayerActionType = ActionType<typeof playerActions>;
export const PlayerActionList = [
	playerActions.playerRequest,
];

export default (state: any = initialState, action: PlayerActionType) => {
	switch (action.type) {
		case getType(playerActions.playerRequest):
			return {
				...state,
				// moveTarget: action.payload.position,
			};
		default:
			return state;
	}
};
