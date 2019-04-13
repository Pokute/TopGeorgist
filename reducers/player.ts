import { ActionType, getType } from 'typesafe-actions';

import * as playerActions from '../actions/player'

export interface PlayerType {
};

export const initialState: PlayerType = {
	moveTarget: undefined,
};

export type PlayerActionType = ActionType<typeof playerActions>;
export const PlayerActionList = [
	playerActions.playerRequest,
];

export default (state: PlayerType = initialState, action: PlayerActionType): PlayerType => {
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
