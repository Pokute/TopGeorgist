import { ActionType, getType } from 'typesafe-actions';

import * as playerActions from '../actions/player'

export interface PlayerType {
};

export const initialState: PlayerType = {
};

export type PlayerActionType = ActionType<typeof playerActions>;

export default (state: PlayerType = initialState, action: PlayerActionType): PlayerType => {
	switch (action.type) {
		case getType(playerActions.playerRequest):
			return {
				...state,
			};
		default:
			return state;
	}
};
